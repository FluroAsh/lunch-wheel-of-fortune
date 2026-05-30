# PRD: Real-Time Rooms — Collaborative Wheel Spins

**Status:** Draft  
**Feature area:** Multi-user collaboration  
**Transport layer:** WebSocket (PartyKit)

## 1. Overview

Today the app is single-user and session-less. A user opens it on their phone, picks nearby restaurants, and spins the wheel alone. The outcome lives only in that browser tab.

This PRD describes extending the app so that a group of people (e.g. a lunch group at an office) can join a shared **Room**, collectively agree on the shortlist of places, watch the same wheel spin in real time, react to the result, and discuss it via in-room chat — without requiring accounts or passwords.

The primary interaction surface is the existing `/spin` page. Rooms wrap around it; everything else (map, nearby places) remains unchanged.

## 2. Goals

| # | Goal |
|---|------|
| G1 | A user can create a Room and share a link/code with colleagues |
| G2 | Multiple users join the same Room and see each other's presence |
| G3 | The wheel state (selected places, current spin, result) is synchronised in real time |
| G4 | Users can send chat messages within a Room |
| G5 | Users can react to a spin result (emoji reactions) |
| G6 | Users can vote on the outcome ("veto" / "approve") |
| G7 | All features degrade gracefully for solo users (rooms are opt-in) |
| G8 | No mandatory account creation — join with a display name only |

## 3. Non-Goals

| # | Non-goal |
|---|----------|
| NG1 | Persistent history / chat logs after the browser closes (V1) |
| NG2 | Full authentication or per-user profiles |
| NG3 | Private/password-protected rooms (V1 — shareable code is sufficient) |
| NG4 | Mobile push notifications |
| NG5 | Rooms persisting longer than a configurable idle TTL (default: 2 hours) |

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

> **US-08** — As a host, I want to control who can spin (host-only mode vs. open mode).

> **US-09** — As a member, I want the wheel segments to match the host's current selection of places so we are all working from the same list.

### 4.3 Chat

> **US-10** — As a Room member, I want to send short chat messages that appear for everyone in the Room in real time.

> **US-11** — As a Room member, I want to see a timestamp and sender name on every message.

> **US-12** — As a Room member, I want system messages for join/leave/spin events so I have context without scrolling through chat.

### 4.4 Reactions

> **US-13** — As a Room member, I want to react to a spin result with an emoji so I can express my feelings quickly.

> **US-14** — As a Room member, I want to see a live aggregate of reactions (e.g. "3 × 🎉, 2 × 😭") so I know the group sentiment.

> **US-15** — As a Room member, I want emoji reactions to float up on screen momentarily (like a live stream) for visual delight.

### 4.5 Voting

> **US-16** — As a host, I want to start a "veto vote" after a spin so the group can collectively accept or reject the result.

> **US-17** — As a Room member, I want to cast an approve ✅ or veto ❌ vote and see the tally update in real time.

> **US-18** — As a host, I want the vote to auto-resolve once everyone has voted, or after a configurable timeout (default 30 s).

> **US-19** — As a Room member, I want to know the vote outcome — accept the winner or trigger a re-spin.

## 5. Proposed Architecture

### 5.1 Technology Choice: PartyKit

**PartyKit** is a serverless, edge-native WebSocket platform built specifically for real-time collaborative Next.js apps. It runs on Cloudflare Workers and provides:

- Persistent server objects ("parties") per Room — state lives in the Worker, not in the Next.js server
- First-class Next.js integration (`partysocket` client library)
- Automatic hibernation (no idle cost)
- Built-in presence via connection tracking
- Scales without managing infra

**Why not alternatives:**

| Option | Trade-off |
|--------|-----------|
| Socket.IO + custom server | Requires a separate always-on Node server; incompatible with Vercel serverless |
| Pusher Channels | Client-trigger cost; no persistent server-side state; limited free tier |
| Ably | Excellent managed WS, but more expensive at scale and heavier SDK surface |
| Next.js native `app/` + SSE | SSE is one-way; inadequate for bidirectional chat/spin sync |
| Raw Cloudflare Durable Objects | PartyKit abstracts these directly — no added value in going lower level |

**PartyKit docs:** https://docs.partykit.io

### 5.2 System Topology

```
Browser A (host)          Browser B (member)         Browser C (member)
     │                          │                          │
     │  WebSocket (partysocket)  │  WebSocket (partysocket) │
     └──────────────────────────┴─────────┐                │
                                          ▼                 │
                              PartyKit Worker               │
                              ┌─────────────────────────┐  │
                              │  Room Party (per roomId) │◄─┘
                              │  - participants Map       │
                              │  - wheel state            │
                              │  - chat history (ring)    │
                              │  - vote state             │
                              └────────────┬────────────┘
                                           │ broadcast / unicast
                              ┌────────────▼────────────┐
                              │  Next.js App (existing)  │
                              │  /api/rooms/[roomId]     │  ← HTTP REST for room
                              │  (create, metadata)      │     creation & metadata
                              └─────────────────────────┘
```

The Party Worker is authoritative. Clients are thin — they send intentions (e.g. `SPIN_REQUEST`) and receive canonical state diffs/events.

### 5.3 New Route Structure

```
src/
├── app/
│   ├── room/
│   │   ├── page.tsx            ← "Create or join" landing
│   │   └── [roomId]/
│   │       └── page.tsx        ← In-room experience (map + wheel + chat)
│   └── api/
│       └── rooms/
│           └── route.ts        ← POST to create room, GET metadata
├── features/
│   ├── rooms/                  ← New feature module
│   │   ├── components/
│   │   │   ├── room-panel/     ← Sidebar: presence + chat + vote
│   │   │   ├── presence-bar/   ← Avatars of connected users
│   │   │   ├── chat/           ← Chat thread + input
│   │   │   ├── reaction-burst/ ← Floating emoji animation
│   │   │   └── vote-overlay/   ← Approve/veto modal
│   │   ├── hooks/
│   │   │   ├── use-room.ts     ← Core WS connection + state
│   │   │   ├── use-chat.ts     ← Chat send/receive
│   │   │   ├── use-reactions.ts
│   │   │   └── use-vote.ts
│   │   ├── store/
│   │   │   └── room-store.ts   ← Zustand slice for room UI state
│   │   └── types.ts            ← All room-related TypeScript types
│   └── wheel/                  ← Existing; receives remote spin events
└── party/
    └── room.ts                 ← PartyKit server (runs on Cloudflare edge)
```

### 5.4 Data Models

```typescript
// src/features/rooms/types.ts

export type Participant = {
  id: string;         // socket connection ID (assigned by PartyKit)
  name: string;       // display name (user-provided)
  isHost: boolean;
  joinedAt: number;   // unix ms
  color: string;      // deterministic color from id (for avatar)
};

export type WheelRoomState = {
  selectedPlaceIds: string[];
  isSpinning: boolean;
  prizeIndex: number | null;
  lastSpinAt: number | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  sentAt: number;
  type: "user" | "system";
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

export type RoomState = {
  roomId: string;
  createdAt: number;
  participants: Record<string, Participant>;
  wheel: WheelRoomState;
  chat: ChatMessage[];       // ring buffer — last 100 messages
  reactions: Reaction[];     // last 50 reactions (for floating burst display)
  reactionTally: ReactionTally;
  vote: VoteState;
};
```

### 5.5 WebSocket Message Protocol

All messages are JSON. The `type` discriminant drives both client→server and server→client routing.

#### Client → Server (intentions)

```typescript
type ClientMessage =
  | { type: "SET_NAME";       name: string }
  | { type: "SPIN_REQUEST" }
  | { type: "SYNC_PLACES";    selectedPlaceIds: string[] }
  | { type: "CHAT_SEND";      body: string }
  | { type: "REACT";          emoji: string }
  | { type: "VOTE_START" }
  | { type: "VOTE_CAST";      vote: "approve" | "veto" }
  | { type: "PING" };
```

#### Server → Client (state diffs / events)

```typescript
type ServerMessage =
  | { type: "ROOM_STATE";       state: RoomState }                   // full state on connect
  | { type: "PARTICIPANT_JOIN"; participant: Participant }
  | { type: "PARTICIPANT_LEAVE";participantId: string }
  | { type: "SPIN_START";       prizeIndex: number; spinAt: number } // authoritative spin
  | { type: "SPIN_COMPLETE";    prizeIndex: number }
  | { type: "PLACES_UPDATED";   selectedPlaceIds: string[] }
  | { type: "CHAT_MESSAGE";     message: ChatMessage }
  | { type: "REACTION";         reaction: Reaction; tally: ReactionTally }
  | { type: "VOTE_STARTED";     expiresAt: number }
  | { type: "VOTE_UPDATED";     votes: VoteState["votes"]; tally: { approve: number; veto: number } }
  | { type: "VOTE_RESOLVED";    outcome: "approved" | "vetoed" }
  | { type: "PONG" };
```

#### Authoritative spin sequencing

The Party Worker is the single source of truth for spin timing:

1. Host sends `SPIN_REQUEST`
2. Worker validates (is spinner the host? or open mode?), picks a deterministic `prizeIndex`, records `spinAt` timestamp
3. Worker broadcasts `SPIN_START { prizeIndex, spinAt }` to **all** connections
4. Each client starts the canvas animation; since all clients receive the same `prizeIndex` they will land on the same segment
5. After `SPIN_DURATION_MS` (4 500 ms) the Worker broadcasts `SPIN_COMPLETE`

This eliminates animation drift — clients do not need to synchronise clocks beyond the initial `spinAt` offset.

### 5.6 PartyKit Server Sketch

```typescript
// party/room.ts
import type * as Party from "partykit/server";
import type { ClientMessage, RoomState, ServerMessage } from "../src/features/rooms/types";

const CHAT_RING_SIZE = 100;
const REACTION_RING_SIZE = 50;
const VOTE_TIMEOUT_MS = 30_000;
const ROOM_IDLE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export default class RoomParty implements Party.Server {
  state: RoomState;

  constructor(readonly room: Party.Room) {
    this.state = this.emptyState(room.id);
  }

  private emptyState(roomId: string): RoomState { /* ... */ }

  onConnect(conn: Party.Connection) {
    // Send full state snapshot to the new connection
    conn.send(JSON.stringify({ type: "ROOM_STATE", state: this.state } satisfies ServerMessage));
  }

  onClose(conn: Party.Connection) {
    const participant = this.state.participants[conn.id];
    if (!participant) return;
    delete this.state.participants[conn.id];
    this.broadcast({ type: "PARTICIPANT_LEAVE", participantId: conn.id });
    this.maybeResolveVote();
  }

  onMessage(message: string, sender: Party.Connection) {
    const msg: ClientMessage = JSON.parse(message);
    switch (msg.type) {
      case "SET_NAME":      return this.handleSetName(sender, msg);
      case "SPIN_REQUEST":  return this.handleSpinRequest(sender);
      case "SYNC_PLACES":   return this.handleSyncPlaces(sender, msg);
      case "CHAT_SEND":     return this.handleChat(sender, msg);
      case "REACT":         return this.handleReaction(sender, msg);
      case "VOTE_START":    return this.handleVoteStart(sender);
      case "VOTE_CAST":     return this.handleVoteCast(sender, msg);
      case "PING":          return sender.send(JSON.stringify({ type: "PONG" } satisfies ServerMessage));
    }
  }

  private broadcast(msg: ServerMessage, exclude?: string) {
    for (const conn of this.room.getConnections()) {
      if (conn.id !== exclude) conn.send(JSON.stringify(msg));
    }
  }

  // ... handler implementations
}
```

### 5.7 Client-Side Hook: `useRoom`

```typescript
// src/features/rooms/hooks/use-room.ts
import usePartySocket from "partysocket/react";
import { useRoomStore } from "../store/room-store";
import type { ServerMessage } from "../types";

export function useRoom(roomId: string) {
  const { applyMessage } = useRoomStore();

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    room: roomId,
    onMessage(event) {
      const msg: ServerMessage = JSON.parse(event.data);
      applyMessage(msg);
    },
  });

  const sendSpinRequest = () =>
    socket.send(JSON.stringify({ type: "SPIN_REQUEST" }));

  const sendChat = (body: string) =>
    socket.send(JSON.stringify({ type: "CHAT_SEND", body }));

  const sendReaction = (emoji: string) =>
    socket.send(JSON.stringify({ type: "REACT", emoji }));

  const startVote = () =>
    socket.send(JSON.stringify({ type: "VOTE_START" }));

  const castVote = (vote: "approve" | "veto") =>
    socket.send(JSON.stringify({ type: "VOTE_CAST", vote }));

  return { sendSpinRequest, sendChat, sendReaction, startVote, castVote };
}
```

### 5.8 Zustand Room Store

The existing `useMapStore` is untouched. A separate `useRoomStore` is introduced:

```typescript
// src/features/rooms/store/room-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { RoomState, ServerMessage } from "../types";

type RoomStore = {
  room: RoomState | null;
  displayName: string;
  setDisplayName: (name: string) => void;
  applyMessage: (msg: ServerMessage) => void;
};

export const useRoomStore = create<RoomStore>()(
  devtools((set) => ({
    room: null,
    displayName: "",
    setDisplayName: (displayName) => set({ displayName }),
    applyMessage: (msg) => set((state) => ({ room: applyServerMessage(state.room, msg) })),
  }))
);

function applyServerMessage(room: RoomState | null, msg: ServerMessage): RoomState | null {
  switch (msg.type) {
    case "ROOM_STATE":       return msg.state;
    case "PARTICIPANT_JOIN": return room && { ...room, participants: { ...room.participants, [msg.participant.id]: msg.participant } };
    case "PARTICIPANT_LEAVE": {
      if (!room) return null;
      const { [msg.participantId]: _, ...rest } = room.participants;
      return { ...room, participants: rest };
    }
    case "SPIN_START":       return room && { ...room, wheel: { ...room.wheel, isSpinning: true, prizeIndex: msg.prizeIndex } };
    case "SPIN_COMPLETE":    return room && { ...room, wheel: { ...room.wheel, isSpinning: false } };
    case "CHAT_MESSAGE":     return room && { ...room, chat: [...room.chat.slice(-99), msg.message] };
    case "REACTION":         return room && { ...room, reactionTally: msg.tally, reactions: [...room.reactions.slice(-49), msg.reaction] };
    case "VOTE_UPDATED":     return room && { ...room, vote: { ...room.vote, votes: msg.votes } };
    case "VOTE_RESOLVED":    return room && { ...room, vote: { ...room.vote, outcome: msg.outcome, active: false } };
    default:                 return room;
  }
}
```

## 6. UI / UX Design

### 6.1 Entry Point

The existing home page and `/spin` page are **unchanged** for solo users. A "Create Room" button is added to the spin page header. Clicking it:

1. Generates a short room code (6 alphanumeric characters)
2. Navigates to `/room/[roomId]`
3. Prompts for a display name (modal or inline input)

An existing solo user can also accept a `/room/[roomId]` invite URL directly from the home page.

### 6.2 Room Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Site Header                    [Leave Room]         │
├──────────────────────┬──────────────────────────────┤
│                      │  Room Panel                  │
│  Wheel + Controls    │  ┌──────────────────────┐    │
│  (existing /spin UI) │  │  Presence Bar        │    │
│                      │  │  [A] [B] [C] +2      │    │
│  ┌──────────────┐    │  ├──────────────────────┤    │
│  │   Wheel      │    │  │  Chat Thread         │    │
│  │   Canvas     │    │  │  ...                 │    │
│  └──────────────┘    │  │  ...                 │    │
│                      │  ├──────────────────────┤    │
│  [Spin the Wheel]    │  │  Message Input       │    │
│                      │  └──────────────────────┘    │
├──────────────────────┴──────────────────────────────┤
│  Reaction Bar: 🎉 🔥 😭 😤 👀 (tap to react)         │
└─────────────────────────────────────────────────────┘
```

On mobile the Room Panel collapses to a bottom drawer (consistent with the existing `vaul` drawer pattern).

### 6.3 Spin Synchronisation UX

- **Host** sees a normal "Spin the Wheel" button
- **Members** see a disabled "Spin the Wheel" button with "Waiting for host..." label (unless open mode is enabled)
- On `SPIN_START`, all clients start the canvas animation simultaneously
- A subtle "Spinning..." system message is injected into chat

### 6.4 Vote Overlay

After a spin resolves, the host can tap "Start Vote". A bottom sheet appears for all members:

```
┌────────────────────────────────┐
│  🍜 Wagamama — vote?           │
│                                │
│  [✅ Approve]   [❌ Veto]       │
│                                │
│  3 voted · 1 remaining · 22s   │
└────────────────────────────────┘
```

If the majority veto, a re-spin is triggered automatically.

### 6.5 Reaction Burst

Emoji reactions float up from the bottom of the wheel canvas area using a CSS keyframe animation, similar to live-stream reactions. Each reaction is individually animated and fades out after ~2 s. The `reaction-burst` component receives a stream of `Reaction` objects and manages a short-lived render list.

## 7. Environment & Configuration

```bash
# .env.local additions
NEXT_PUBLIC_PARTYKIT_HOST=<project>.partykit.dev   # dev: localhost:1999
```

```json
// partykit.json  (new file at project root)
{
  "name": "lunch-wheel-of-fortune",
  "main": "party/room.ts"
}
```

```bash
# New dependencies
npm install partysocket partykit
```

The PartyKit dev server runs alongside `next dev`:

```json
// package.json scripts additions
"dev:party": "partykit dev",
"dev:all": "concurrently \"npm run dev\" \"npm run dev:party\""
```

## 8. Phased Implementation Plan

### Phase 1 — Room Infrastructure (foundation)
- PartyKit setup, `party/room.ts` (connection, state, broadcast)
- `/api/rooms` HTTP route (create room, return `roomId`)
- `/room/[roomId]/page.tsx` scaffold
- `useRoomStore` Zustand slice
- `useRoom` hook (connect, disconnect, name handshake)
- Presence bar component
- **Deliverable:** Multiple users can join a room and see each other's names

### Phase 2 — Shared Wheel
- `SPIN_REQUEST` / `SPIN_START` / `SPIN_COMPLETE` message handlers
- `SYNC_PLACES` so host's selection propagates to members
- Modify `/spin` page wheel to accept remote spin events (controlled by `useRoomStore`)
- Host-only spin guard
- **Deliverable:** All room members watch the same spin, landing on the same winner

### Phase 3 — Chat
- `CHAT_SEND` / `CHAT_MESSAGE` message handlers
- Ring buffer (last 100 messages) in Party state
- System messages for join/leave/spin events
- Chat panel component (thread + input)
- **Deliverable:** Real-time text chat within a room

### Phase 4 — Reactions
- `REACT` / `REACTION` message handlers with tally aggregation
- Reaction bar (emoji picker strip)
- `reaction-burst` floating animation component
- **Deliverable:** Emoji reactions with floating burst visual

### Phase 5 — Voting
- `VOTE_START` / `VOTE_CAST` / `VOTE_RESOLVED` message handlers
- 30 s auto-resolve timer in Party Worker
- Vote overlay UI component
- Veto → auto re-spin logic
- **Deliverable:** Post-spin approval voting with auto re-spin on veto

## 9. Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Animation drift across clients | Members see wheel land on different segments | Use authoritative `prizeIndex` from server; all clients compute same target rotation |
| Room state lost on Worker cold start | Users experience disconnect + state reset | Persist `RoomState` to PartyKit storage (`this.room.storage`); re-hydrate on cold start |
| Chat spam / message flood | Degraded UX | Rate-limit `CHAT_SEND` per connection in the Worker (e.g. 2 messages/s) |
| Room ID collision | Two groups end up in the same room | Use CSPRNG for room ID generation; 6-char alphanumeric = 2.18 billion combinations |
| Large rooms (>20 users) | Broadcast cost, tally accuracy | Aggregate reactions server-side (already in design); benchmark at 50 connections |
| PartyKit cold start latency | First connection is slow | Workers typically start in <50 ms on Cloudflare; acceptable for this use case |
| CORS / HTTPS mismatch in dev | WebSocket handshake fails | PartyKit dev server mirrors `--experimental-https` via its own cert; document in README |

## 10. Open Questions

| # | Question | Owner |
|---|----------|-------|
| OQ-1 | Should room codes be human-readable (e.g. "cobalt-tiger-7") instead of alphanumeric? Easier to share verbally. | Product |
| OQ-2 | Should members be able to update the selected places list, or is that host-only? | Product |
| OQ-3 | Should vote results be anonymous or attributed? | Product |
| OQ-4 | Is a 2-hour Room TTL appropriate for the target use case? | Product |
| OQ-5 | Should chat messages survive a page refresh (short-term persistence via PartyKit storage)? | Engineering |
| OQ-6 | Should the host be transferable if the original host disconnects? | Product |
| OQ-7 | Emoji set for reactions — curated subset (6–8) or full emoji picker? | Design |

## 11. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | A user can create a Room and share the URL; a second user joins within 5 s on a cold Party |
| AC-02 | All connected users see the same `prizeIndex` at spin completion |
| AC-03 | A chat message sent by one user appears for all others within 200 ms on a 4G connection |
| AC-04 | An emoji reaction triggers a visible floating animation within 150 ms of the sender tapping |
| AC-05 | A vote resolves within 1 s of the last participant voting, or after 30 s timeout |
| AC-06 | A solo user on `/spin` (no room) sees no visible change to the existing UI |
| AC-07 | The Room panel is fully functional on a 375 px wide mobile viewport |
| AC-08 | A user who refreshes the page reconnects to the same Room with the same display name (persisted in `sessionStorage`) |
| AC-09 | On Party Worker cold start, full `RoomState` is restored from storage within 500 ms |
| AC-10 | No more than 2 messages per second per connection are forwarded to other participants (spam protection) |

## 12. Appendix — Key Library References

- **PartyKit docs:** https://docs.partykit.io
- **PartyKit + Next.js guide:** https://docs.partykit.io/guides/using-partykit-with-nextjs
- **`partysocket` React hook:** https://docs.partykit.io/reference/partysocket-api
- **PartyKit storage API:** https://docs.partykit.io/reference/partyserver-api/#storage
- **Cloudflare Workers limits:** https://developers.cloudflare.com/workers/platform/limits (relevant for Party Worker CPU budget)
