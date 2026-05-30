# PRD: Real-Time Rooms — Collaborative Wheel Spins

**Status:** Draft  
**Feature area:** Multi-user collaboration  
**Transport layer:** Supabase Realtime (Broadcast + Presence)

## 1. Overview

Today the app is single-user and session-less. A user opens it on their phone, picks nearby restaurants, and spins the wheel alone. The outcome lives only in that browser tab.

This PRD describes extending the app so that a group of people (e.g. a lunch group at an office) can join a shared **Room**, watch the same wheel spin in real time, react to the result, and vote to accept or veto the outcome — without requiring accounts or passwords.

The primary interaction surface is the existing `/spin` page. Rooms wrap around it; everything else (map, nearby places) remains unchanged.

Supabase is the chosen platform for Realtime, and will later serve as the Auth and database layer too — so this feature introduces a single SDK (`@supabase/supabase-js`) that covers the full stack going forward.

## 2. Goals

| # | Goal |
|---|------|
| G1 | A user can create a Room and share a link/code with colleagues |
| G2 | Multiple users join the same Room and see each other's presence |
| G3 | The wheel state (current spin, result) is synchronised in real time |
| G4 | Users can react to a spin result with emoji reactions |
| G5 | Users can vote on the outcome ("veto" / "approve") |
| G6 | All features degrade gracefully for solo users (rooms are opt-in) |
| G7 | No mandatory account creation — join with a display name only |

## 3. Non-Goals

| # | Non-goal |
|---|----------|
| NG1 | In-app chat — groups will communicate via Slack, Teams, or in person |
| NG2 | Persistent room history or spin logs (V1) |
| NG3 | Full authentication or per-user profiles (deferred to Auth integration) |
| NG4 | Private/password-protected rooms (V1 — shareable code is sufficient) |
| NG5 | Rooms persisting longer than Supabase Realtime channel idle TTL |
| NG6 | Supporting more than ~10 concurrent users per room |

## 4. User Stories

### 4.1 Room Creation & Joining

> **US-01** — As a user, I want to create a Room from the spin page so that I can share it with my lunch group.

> **US-02** — As a user, I want to join a Room via a short code or URL so that I do not have to configure anything.

> **US-03** — As a user, I want to enter a display name when joining so that my colleagues can identify me.

> **US-04** — As a host, I want to see who is currently in the Room so that I know who is present before spinning.

> **US-05** — As a user, I want to leave a Room and return to solo mode at any time.

### 4.2 Shared Wheel

> **US-06** — As a host, I want to trigger a spin and have all Room members see the same animation simultaneously.

> **US-07** — As a member, I want to see the wheel result appear on my screen at the same time as everyone else.

> **US-08** — As a host, I want to control who can spin (host-only by default).

> **US-09** — As a member, I want the wheel segments to match the host's current selection of places so we are all working from the same list.

### 4.3 Reactions

> **US-10** — As a Room member, I want to react to a spin result with an emoji so I can express my feelings quickly.

> **US-11** — As a Room member, I want to see a live aggregate of reactions (e.g. "3 × 🎉, 2 × 😭") so I know the group sentiment.

> **US-12** — As a Room member, I want emoji reactions to float up on screen momentarily for visual delight.

### 4.4 Voting

> **US-13** — As a host, I want to start a "veto vote" after a spin so the group can collectively accept or reject the result.

> **US-14** — As a Room member, I want to cast an approve ✅ or veto ❌ vote and see the tally update in real time.

> **US-15** — As a host, I want the vote to auto-resolve once everyone has voted, or after a configurable timeout (default 30 s).

> **US-16** — As a Room member, I want to know the vote outcome — accept the winner or trigger a re-spin.

## 5. Proposed Architecture

### 5.1 Technology Choice: Supabase Realtime

Supabase Realtime is chosen because it is already on the roadmap for Auth and database. Using it here means:
- A single SDK (`@supabase/supabase-js`) covers the full stack — no additional runtime or deployment
- No separate server process alongside `next dev`
- Generous free tier (200 concurrent connections, 2M messages/month) — safe headroom for a side project that spikes on social media
- Flat-rate paid plans ($25/month Pro) for predictable cost at scale

Supabase Realtime provides three primitives. This feature uses two:

| Primitive | Used for |
|-----------|----------|
| **Broadcast** | Spin events, reactions, vote casts — ephemeral, no persistence needed |
| **Presence** | Participant list — who is currently connected, built-in CRDT sync |
| Postgres Changes | Not used in V1; available later for persisting spin history |

**Why not alternatives:**

| Option | Trade-off |
|--------|-----------|
| PartyKit | Requires deploying a separate Cloudflare Worker; additional service to manage; separate free-tier limits |
| Socket.IO + custom server | Requires an always-on Node server; incompatible with Vercel serverless |
| Pusher Channels | Client-trigger costs; no persistent server state; weaker free tier |
| Ably | Excellent managed WS, but a separate SDK with no DB/Auth story |

### 5.2 How Supabase Realtime Works for This Feature

Supabase Realtime is a relay — messages sent by one client are fanned out to all others subscribed to the same channel. There is no server-side room logic. This means:

- The **host's browser** is the authority for decisions (e.g. picking `prizeIndex`, starting a vote)
- The host broadcasts a `SPIN_START` event with a pre-computed `prizeIndex`; all members receive it and start the same canvas animation
- Vote tallying is computed locally by each client from the stream of `VOTE_CAST` events
- Presence tracking is handled by Supabase itself via `channel.track()` — no manual participant map

For a trust-based social lunch tool with small groups, the "host is authoritative" model is appropriate. There is no adversarial scenario worth protecting against.

### 5.3 System Topology

```
Browser A (host)          Browser B (member)         Browser C (member)
     │                          │                          │
     │  @supabase/supabase-js   │  @supabase/supabase-js   │
     │  Realtime channel        │  Realtime channel        │
     └──────────────────────────┴──────────────────────────┘
                                          │
                              Supabase Realtime (relay)
                              Channel: room:<roomId>
                              ┌─────────────────────────┐
                              │  Broadcast              │ ← spin, reactions, votes
                              │  Presence               │ ← participant list
                              └─────────────────────────┘
                                          │
                              ┌─────────────────────────┐
                              │  Next.js App             │
                              │  /api/rooms/route.ts     │ ← POST create room (generate ID)
                              └─────────────────────────┘
```

No Worker or edge function is required. The Next.js API route only generates a room ID and validates the request — no WebSocket logic lives server-side.

### 5.4 New Route Structure

```
src/
├── app/
│   ├── room/
│   │   ├── page.tsx                ← "Create or join" landing
│   │   └── [roomId]/
│   │       └── page.tsx            ← In-room experience (wheel + presence + vote)
│   └── api/
│       └── rooms/
│           └── route.ts            ← POST create room, returns roomId
├── features/
│   └── rooms/                      ← New feature module
│       ├── components/
│       │   ├── presence-bar/       ← Connected participant avatars
│       │   ├── reaction-burst/     ← Floating emoji animation
│       │   └── vote-overlay/       ← Approve/veto modal
│       ├── hooks/
│       │   ├── use-room.ts         ← Channel subscribe/unsubscribe + broadcast helpers
│       │   ├── use-reactions.ts    ← Reaction send + tally + burst list
│       │   └── use-vote.ts         ← Vote start/cast + local tally + auto-resolve
│       ├── store/
│       │   └── room-store.ts       ← Zustand slice for room UI state
│       └── types.ts                ← All room-related TypeScript types
```

No `party/` directory. No Worker. The realtime surface is entirely within `src/features/rooms/`.

### 5.5 Data Models

```typescript
// src/features/rooms/types.ts

export type Participant = {
  id: string;          // Supabase Presence key (generated client-side, e.g. nanoid)
  name: string;        // user-provided display name
  isHost: boolean;
  joinedAt: number;    // unix ms
  color: string;       // deterministic from id, for avatar display
};

export type WheelBroadcastState = {
  selectedPlaceIds: string[];
  isSpinning: boolean;
  prizeIndex: number | null;
};

export type Reaction = {
  emoji: string;
  senderId: string;
  sentAt: number;
};

export type ReactionTally = Record<string, number>; // emoji → count

export type VoteState = {
  active: boolean;
  expiresAt: number | null;
  votes: Record<string, "approve" | "veto">; // participantId → vote
  outcome: "approved" | "vetoed" | "pending" | null;
};

export type RoomMeta = {
  roomId: string;
  hostId: string;
};

// Local state shape (Zustand) — assembled from Presence + Broadcast events
export type RoomClientState = {
  meta: RoomMeta | null;
  participants: Record<string, Participant>;
  wheel: WheelBroadcastState;
  reactions: Reaction[];       // last 50 — drives burst animation
  reactionTally: ReactionTally;
  vote: VoteState;
};
```

### 5.6 Broadcast Message Protocol

All Broadcast events use Supabase's `channel.send({ type: "broadcast", event, payload })` API.

#### Host → Channel (intentions broadcast to all members)

```typescript
type BroadcastEvent =
  | { event: "SPIN_START";      payload: { prizeIndex: number; spinAt: number } }
  | { event: "SPIN_COMPLETE";   payload: { prizeIndex: number } }
  | { event: "PLACES_UPDATED";  payload: { selectedPlaceIds: string[] } }
  | { event: "REACT";           payload: { emoji: string; senderId: string; sentAt: number } }
  | { event: "VOTE_START";      payload: { expiresAt: number } }
  | { event: "VOTE_CAST";       payload: { participantId: string; vote: "approve" | "veto" } }
  | { event: "VOTE_RESOLVED";   payload: { outcome: "approved" | "vetoed" } };
```

All events are sent by one client and received by all subscribers — including the sender. This means every client, including the host, drives its local state from the broadcast stream rather than applying optimistic updates. State is therefore consistent across all participants.

#### Spin sequencing

1. Host clicks "Spin the Wheel" — calls `handleSpinClick()`, picks `prizeIndex` via `Math.random()`, records `spinAt = Date.now()`
2. Host broadcasts `SPIN_START { prizeIndex, spinAt }`
3. All clients (including host) receive the event and start the canvas animation with the same `prizeIndex` → same landing segment
4. After `SPIN_DURATION_MS` (4 500 ms) each client fires its own `onSpinComplete` callback — no `SPIN_COMPLETE` broadcast needed unless the host wants to gate the vote start

#### Vote auto-resolve (client-side)

With no server-side timer, the host's client is responsible for resolving the vote. Approach:

- On `VOTE_START`, the host's `useVote` hook starts a `setTimeout` for 30 s
- As `VOTE_CAST` events arrive, the hook checks if all present participants have voted
- Whichever fires first (timeout or full quorum) triggers a `VOTE_RESOLVED` broadcast
- Non-host clients derive tally state locally from `VOTE_CAST` events; they do not resolve

This works correctly as long as the host stays connected for the duration of the vote, which is a reasonable assumption for a small group session.

### 5.7 `useRoom` Hook

```typescript
// src/features/rooms/hooks/use-room.ts
import { useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRoomStore } from "../store/room-store";
import type { BroadcastEvent, Participant } from "../types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function useRoom(roomId: string, participant: Participant) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { applyBroadcast, setParticipants } = useRoomStore();

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<Participant>();
        setParticipants(
          Object.fromEntries(
            Object.values(state).flatMap((list) => list.map((p) => [p.id, p]))
          )
        );
      })
      .on("broadcast", { event: "*" }, ({ event, payload }) => {
        applyBroadcast(event as BroadcastEvent["event"], payload);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(participant);
        }
      });

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const broadcast = (event: BroadcastEvent["event"], payload: object) =>
    channelRef.current?.send({ type: "broadcast", event, payload });

  return { broadcast };
}
```

### 5.8 Zustand Room Store

The existing `useMapStore` is untouched. A separate `useRoomStore` handles all room UI state:

```typescript
// src/features/rooms/store/room-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BroadcastEvent, Participant, RoomClientState } from "../types";

type RoomStore = RoomClientState & {
  displayName: string;
  setDisplayName: (name: string) => void;
  setParticipants: (participants: Record<string, Participant>) => void;
  applyBroadcast: (event: BroadcastEvent["event"], payload: unknown) => void;
};
```

The `applyBroadcast` reducer is a pure function mapping event + payload → next `RoomClientState`. Presence updates come through `setParticipants` directly from the Supabase Presence sync callback.

## 6. UI / UX Design

### 6.1 Entry Point

The existing home page and `/spin` page are **unchanged** for solo users. A "Create Room" button is added to the spin page header. Clicking it:

1. Calls `POST /api/rooms` → receives a short room code (6 alphanumeric characters)
2. Navigates to `/room/[roomId]`
3. Prompts for a display name (modal or inline input, persisted to `sessionStorage`)

A user receiving a `/room/[roomId]` invite URL is taken directly to the name prompt and then joined into the room.

### 6.2 Room Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Site Header                    [Leave Room]         │
├─────────────────────────────────────────────────────┤
│  Presence Bar: [A] [B] [C]   Room: X4K2PQ  [Copy]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Wheel + Controls (existing /spin UI)                │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │               Wheel Canvas                   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Spin the Wheel]  (disabled for non-hosts)          │
│                                                      │
├─────────────────────────────────────────────────────┤
│  Reaction Bar:  🎉  🔥  😭  😤  👀  (tap to react)   │
└─────────────────────────────────────────────────────┘
```

Vote overlay and reaction burst are layered on top of the wheel canvas as absolute-positioned elements. The layout is single-column on both desktop and mobile — no side panel needed (chat is descoped).

### 6.3 Spin Synchronisation UX

- **Host** sees a normal "Spin the Wheel" button
- **Members** see the same button in a disabled state with "Waiting for host…" label
- On `SPIN_START` broadcast, all clients start the canvas animation with the same `prizeIndex`
- The existing `WheelCanvas` `prizeIndex` prop is driven by `useRoomStore` when in a room, and by local `useState` when in solo mode — no changes to `WheelCanvas` itself

### 6.4 Vote Overlay

After a spin resolves, the host can tap "Start Vote". A bottom sheet (using the existing `vaul` drawer) appears for all members:

```
┌────────────────────────────────┐
│  🍜 Wagamama — vote?           │
│                                │
│  [✅ Approve]   [❌ Veto]       │
│                                │
│  3 voted · 1 remaining · 22s   │
└────────────────────────────────┘
```

If the majority veto, a re-spin is triggered automatically (host's client broadcasts a new `SPIN_START`).

### 6.5 Reaction Burst

Emoji reactions float up from the bottom of the wheel canvas area using a CSS keyframe animation. Each reaction is individually animated and fades out after ~2 s. The `reaction-burst` component maintains a short-lived render list of recent `Reaction` objects, removing entries after their animation completes.

## 7. Environment & Configuration

```bash
# .env.local additions (same keys used for Auth and DB later)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

```bash
# New dependency (single addition — covers Realtime, Auth, and DB)
npm install @supabase/supabase-js
```

No additional config files, no separate dev server, no deployment changes.

## 8. Phased Implementation Plan

### Phase 1 — Room Infrastructure (foundation)
- Install `@supabase/supabase-js`, configure client
- `POST /api/rooms` route (generate and return a 6-char room ID)
- `/room/[roomId]/page.tsx` scaffold with display name prompt
- `useRoomStore` Zustand slice
- `useRoom` hook (subscribe to channel, track presence, unsubscribe on unmount)
- Presence bar component
- Room code copy-to-clipboard
- **Deliverable:** Multiple users can join a room and see each other's names

### Phase 2 — Shared Wheel
- `SPIN_START` / `SPIN_COMPLETE` broadcast handling in `useRoom`
- `PLACES_UPDATED` broadcast so host's selection propagates to members
- Modify `/room/[roomId]` page spin button to call `broadcast("SPIN_START", ...)` instead of local state
- `WheelCanvas` `prizeIndex` driven by `useRoomStore` when in-room
- Host-only spin guard (disable button for non-hosts)
- **Deliverable:** All room members watch the same spin, landing on the same winner

### Phase 3 — Reactions
- `REACT` broadcast handling and tally computation in `useReactions`
- Reaction bar component (6–8 curated emojis)
- `reaction-burst` floating animation component
- **Deliverable:** Emoji reactions with floating burst visual

### Phase 4 — Voting
- `VOTE_START` / `VOTE_CAST` / `VOTE_RESOLVED` broadcast handling in `useVote`
- 30 s client-side auto-resolve timer (host client only)
- Quorum detection (all participants voted → resolve immediately)
- Vote overlay component (reuses existing `vaul` drawer)
- Veto → auto re-spin logic
- **Deliverable:** Post-spin approval voting with auto re-spin on veto

## 9. Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Animation drift across clients | Members see wheel land on different segments | Authoritative `prizeIndex` from host broadcast; all clients compute same target rotation from it |
| Host disconnects during vote | Vote never resolves | On host disconnect (detected via Presence sync), transfer host role to next-oldest participant; new host re-broadcasts remaining vote state |
| Vote auto-resolve race (two clients both resolve) | Duplicate `VOTE_RESOLVED` broadcasts | Non-host clients ignore `VOTE_RESOLVED` events from other non-hosts; only the current host can broadcast resolution |
| Room ID collision | Two groups end up in the same channel | 6-char alphanumeric = ~2.18B combinations; collision probability negligible at side-project scale |
| Stale wheel state for late joiners | New joiner sees an empty or out-of-date wheel | On join, host detects new Presence entry and re-broadcasts current `WheelBroadcastState` |
| Supabase Realtime channel idle timeout | Channel silently drops after inactivity | Send a keep-alive ping on a 25 s interval; Supabase default timeout is 30 s |

## 10. Open Questions

| # | Question | Owner |
|---|----------|-------|
| OQ-1 | Should room codes be human-readable (e.g. "cobalt-tiger-7") instead of alphanumeric? Easier to share verbally. | Product |
| OQ-2 | Should members be able to trigger a spin, or is it always host-only? | Product |
| OQ-3 | Should vote results be anonymous or attributed? | Product |
| OQ-4 | Is the host-transfer-on-disconnect behaviour needed for V1, or is "room ends when host leaves" acceptable? | Product |
| OQ-5 | Emoji set for reactions — curated subset (6–8 pre-selected) or a full emoji picker? | Design |
| OQ-6 | Should the room page replicate the place-selection flow, or does the host share their existing `/spin` page state via `PLACES_UPDATED`? | Engineering |

## 11. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | A user can create a Room and share the URL; a second user joins and appears in the Presence bar within 3 s |
| AC-02 | All connected users see the same `prizeIndex` at spin completion |
| AC-03 | An emoji reaction triggers a visible floating animation within 150 ms of the sender tapping |
| AC-04 | A vote resolves within 1 s of the last participant voting, or after the 30 s timeout |
| AC-05 | A solo user on `/spin` (no room) sees no visible change to the existing UI |
| AC-06 | The room UI is fully functional on a 375 px wide mobile viewport |
| AC-07 | A user who refreshes the page reconnects to the same Room with the same display name (persisted in `sessionStorage`) |
| AC-08 | The Supabase channel keep-alive ping fires every 25 s and prevents idle disconnection |
| AC-09 | No changes are required to `WheelCanvas` — it remains a pure, props-driven component |

## 12. Appendix — Key Library References

- **Supabase Realtime docs:** https://supabase.com/docs/guides/realtime
- **Broadcast API:** https://supabase.com/docs/guides/realtime/broadcast
- **Presence API:** https://supabase.com/docs/guides/realtime/presence
- **`@supabase/supabase-js` client:** https://supabase.com/docs/reference/javascript
- **Supabase free tier limits:** https://supabase.com/pricing (200 concurrent connections, 2M messages/month)
