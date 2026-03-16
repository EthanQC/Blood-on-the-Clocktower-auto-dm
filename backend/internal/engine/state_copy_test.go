package engine

import "testing"

func TestStateCopyPreservesNominationDefenseProgress(t *testing.T) {
	state := NewState("room-1")
	state.Nomination = &Nomination{
		Nominator:       "player-a",
		Nominee:         "player-b",
		NominatorSeat:   1,
		NomineeSeat:     2,
		Votes:           map[string]bool{"player-a": true},
		VoteOrder:       []string{"player-a", "player-b"},
		CurrentVoterIdx: 1,
		DefenseEndsAt:   123,
		VotingEndsAt:    456,
		NominatorEnded:  true,
		NomineeEnded:    false,
	}

	cp := state.Copy()
	if cp.Nomination == nil {
		t.Fatal("expected nomination to be copied")
	}
	if !cp.Nomination.NominatorEnded {
		t.Fatal("expected copied nomination to preserve nominator ended state")
	}
	if cp.Nomination.NomineeEnded {
		t.Fatal("expected copied nomination to preserve nominee pending state")
	}
	if cp.Nomination.Votes["player-a"] != true {
		t.Fatal("expected copied nomination votes to be preserved")
	}
}
