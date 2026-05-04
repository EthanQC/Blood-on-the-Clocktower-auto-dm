package bot

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"sync"
	"testing"
	"time"

	"github.com/qingchang/Blood-on-the-Clocktower-auto-dm/internal/types"
)

type testDispatcher struct {
	mu   sync.Mutex
	cmds []types.CommandEnvelope
	ch   chan types.CommandEnvelope
}

func newTestDispatcher() *testDispatcher {
	return &testDispatcher{
		ch: make(chan types.CommandEnvelope, 8),
	}
}

func (d *testDispatcher) DispatchAsync(cmd types.CommandEnvelope) error {
	d.mu.Lock()
	d.cmds = append(d.cmds, cmd)
	d.mu.Unlock()
	d.ch <- cmd
	return nil
}

func waitForBotCommand(t *testing.T, ch <-chan types.CommandEnvelope) types.CommandEnvelope {
	t.Helper()
	select {
	case cmd := <-ch:
		return cmd
	case <-time.After(5 * time.Second):
		t.Fatal("timed out waiting for bot command")
		return types.CommandEnvelope{}
	}
}

func withFastBotDefenseDelay(t *testing.T) {
	t.Helper()
	oldMin := botDefenseDelayMinMs
	oldMax := botDefenseDelayMaxMs
	botDefenseDelayMinMs = 1
	botDefenseDelayMaxMs = 2
	t.Cleanup(func() {
		botDefenseDelayMinMs = oldMin
		botDefenseDelayMaxMs = oldMax
	})
}

func withFastBotNominationDelay(t *testing.T) {
	t.Helper()
	oldMin := botNominationDelayMinMs
	oldMax := botNominationDelayMaxMs
	botNominationDelayMinMs = 1
	botNominationDelayMaxMs = 2
	t.Cleanup(func() {
		botNominationDelayMinMs = oldMin
		botNominationDelayMaxMs = oldMax
	})
}

func withDeterministicNominationChance(t *testing.T, shouldNominate bool) {
	t.Helper()
	oldFn := botRandomChance
	botRandomChance = func(int) bool { return shouldNominate }
	t.Cleanup(func() {
		botRandomChance = oldFn
	})
}

func newSilentLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}

func TestBotEndsDefenseWhenBotIsNominator(t *testing.T) {
	withFastBotDefenseDelay(t)

	dispatcher := newTestDispatcher()
	b := NewBot(BotConfig{
		UserID:      "bot-a",
		Name:        "Alice",
		Personality: PersonalityRandom,
		Logger:      newSilentLogger(),
	})
	b.SetDispatcher(dispatcher, "room-1")

	payload, _ := json.Marshal(map[string]string{
		"nominator_user_id": "bot-a",
		"nominee":           "human-b",
	})
	b.OnEvent(context.Background(), types.Event{
		EventType: "nomination.created",
		Payload:   payload,
	})

	cmd := waitForBotCommand(t, dispatcher.ch)
	if cmd.Type != "end_defense" {
		t.Fatalf("expected end_defense, got %s", cmd.Type)
	}
	if cmd.ActorUserID != "bot-a" {
		t.Fatalf("expected bot-a to end defense, got %s", cmd.ActorUserID)
	}
}

func TestBotEndsDefenseWhenBotIsNomineeAfterNominatorProgress(t *testing.T) {
	withFastBotDefenseDelay(t)

	dispatcher := newTestDispatcher()
	b := NewBot(BotConfig{
		UserID:      "bot-b",
		Name:        "Bob",
		Personality: PersonalityRandom,
		Logger:      newSilentLogger(),
	})
	b.SetDispatcher(dispatcher, "room-1")

	createdPayload, _ := json.Marshal(map[string]string{
		"nominator_user_id": "human-a",
		"nominee":           "bot-b",
	})
	b.OnEvent(context.Background(), types.Event{
		EventType: "nomination.created",
		Payload:   createdPayload,
	})

	progressPayload, _ := json.Marshal(map[string]string{
		"user_id": "human-a",
	})
	b.OnEvent(context.Background(), types.Event{
		EventType: "defense.progress",
		Payload:   progressPayload,
	})

	cmd := waitForBotCommand(t, dispatcher.ch)
	if cmd.Type != "end_defense" {
		t.Fatalf("expected end_defense, got %s", cmd.Type)
	}
	if cmd.ActorUserID != "bot-b" {
		t.Fatalf("expected bot-b to end defense, got %s", cmd.ActorUserID)
	}
}

func TestBotNominatesKnownAlivePlayer(t *testing.T) {
	withFastBotNominationDelay(t)
	withDeterministicNominationChance(t, true)

	dispatcher := newTestDispatcher()
	b := NewBot(BotConfig{
		UserID:      "bot-a",
		Name:        "Alice",
		Personality: PersonalityAggressive,
		Logger:      newSilentLogger(),
	})
	b.SetDispatcher(dispatcher, "room-1")

	for _, userID := range []string{"bot-a", "human-b", "human-c"} {
		b.OnEvent(context.Background(), types.Event{
			EventType:   "player.joined",
			ActorUserID: userID,
			Payload:     json.RawMessage(`{}`),
		})
	}

	b.OnEvent(context.Background(), types.Event{
		EventType: "phase.nomination",
		Payload:   json.RawMessage(`{}`),
	})

	cmd := waitForBotCommand(t, dispatcher.ch)
	if cmd.Type != "nominate" {
		t.Fatalf("expected nominate, got %s", cmd.Type)
	}
	if cmd.ActorUserID != "bot-a" {
		t.Fatalf("expected bot-a to nominate, got %s", cmd.ActorUserID)
	}

	var payload map[string]string
	if err := json.Unmarshal(cmd.Payload, &payload); err != nil {
		t.Fatalf("failed to decode nomination payload: %v", err)
	}
	if payload["nominee"] == "" || payload["nominee"] == "bot-a" {
		t.Fatalf("expected bot to nominate another alive player, got %+v", payload)
	}
}
