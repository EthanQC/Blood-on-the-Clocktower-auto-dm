package projection

import (
	"encoding/json"
	"testing"

	"github.com/qingchang/Blood-on-the-Clocktower-auto-dm/internal/engine"
	"github.com/qingchang/Blood-on-the-Clocktower-auto-dm/internal/types"
)

func TestProjectEventStreamHidesOtherPlayersRoleAssignments(t *testing.T) {
	state := engine.NewState("room-1")
	state.Reduce(engine.EventPayload{
		Seq:   1,
		Type:  "player.joined",
		Actor: "viewer",
		Payload: map[string]string{
			"name":        "Viewer",
			"seat_number": "1",
			"role":        "player",
		},
	})
	state.Reduce(engine.EventPayload{
		Seq:   2,
		Type:  "player.joined",
		Actor: "other",
		Payload: map[string]string{
			"name":        "Other",
			"seat_number": "2",
			"role":        "player",
		},
	})

	events := []types.Event{
		{
			RoomID:      "room-1",
			Seq:         3,
			EventType:   "role.assigned",
			ActorUserID: "system",
			Payload: json.RawMessage(`{
				"user_id":"other",
				"role":"chef",
				"true_role":"chef",
				"team":"good"
			}`),
		},
		{
			RoomID:      "room-1",
			Seq:         4,
			EventType:   "role.assigned",
			ActorUserID: "system",
			Payload: json.RawMessage(`{
				"user_id":"viewer",
				"role":"washerwoman",
				"true_role":"drunk",
				"team":"good",
				"is_demon":"false"
			}`),
		},
	}

	projected := ProjectEventStream(state, events, "viewer")
	if len(projected) != 1 {
		t.Fatalf("expected only viewer role assignment to be visible, got %d events", len(projected))
	}

	var payload map[string]string
	if err := json.Unmarshal(projected[0].Data, &payload); err != nil {
		t.Fatalf("failed to decode projected payload: %v", err)
	}
	if payload["user_id"] != "viewer" {
		t.Fatalf("expected viewer role assignment, got %+v", payload)
	}
	if payload["true_role"] != "" || payload["is_demon"] != "" {
		t.Fatalf("expected sensitive fields to be stripped, got %+v", payload)
	}
}

func TestProjectEventStreamKeepsWhisperPrivate(t *testing.T) {
	state := engine.NewState("room-1")
	for idx, userID := range []string{"sender", "recipient", "observer"} {
		state.Reduce(engine.EventPayload{
			Seq:   int64(idx + 1),
			Type:  "player.joined",
			Actor: userID,
			Payload: map[string]string{
				"name":        userID,
				"seat_number": []string{"1", "2", "3"}[idx],
				"role":        "player",
			},
		})
	}

	events := []types.Event{{
		RoomID:      "room-1",
		Seq:         4,
		EventType:   "whisper.sent",
		ActorUserID: "sender",
		Payload: json.RawMessage(`{
			"to_user_id":"recipient",
			"message":"secret"
		}`),
	}}

	if projected := ProjectEventStream(state, events, "observer"); len(projected) != 0 {
		t.Fatalf("expected observer to see no whisper events, got %d", len(projected))
	}
	if projected := ProjectEventStream(state, events, "sender"); len(projected) != 1 {
		t.Fatalf("expected sender to see whisper event, got %d", len(projected))
	}
	if projected := ProjectEventStream(state, events, "recipient"); len(projected) != 1 {
		t.Fatalf("expected recipient to see whisper event, got %d", len(projected))
	}
}
