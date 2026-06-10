# Buxmate Product Brief

Buxmate is a privacy-first event planning SaaS for bucks parties, hens parties and group weekends.

The core problem is that one organiser often has to coordinate a group of people who may not all know each other. They need to manage the itinerary, RSVPs, costs, payments, reminders and communication without messy group chats or spreadsheets.

## Core MVP Workflow

Create Event → Add Activities → Invite Guests → Guests RSVP → Track Payments

## Positioning

Buxmate helps organisers manage messy group events where people don’t all know each other — RSVPs, payments, itinerary and private communication in one place.

## Tagline

Plan the chaos.  
Split the cost.  
Keep it private.

## Target Users

Primary users:

- Best men
- Maids of honour
- Groomsmen
- Bridesmaids
- Friends organising group weekends
- People planning one-off private events

Guests should not need to create a full account just to RSVP or view event details.

## Privacy Principle

Events are private by default.

Guests should only access an event through:

- a private invite link
- verified guest access
- later, an optional account

Images must be stored privately and displayed only after permission checks.

## MVP Features

### Organiser

The organiser can:

- create an event
- add activities
- add guests
- generate invite links
- view RSVP status
- view payment status
- manually mark guests as paid

### Guest

A guest can:

- open a private invite link
- enter name/email/phone
- view the event itinerary
- RSVP to each activity
- see what they owe
- see payment instructions

## Event Structure

An event can have many activities.

Example:

Event:
Dave’s Bucks Weekend

Activities:

- Friday drinks
- Saturday paintball
- Dinner
- Accommodation
- Recovery breakfast

Each activity can have:

- title
- description
- location
- start/end time
- cost
- RSVP status per guest

## Payment Philosophy

Do not build payment processing in v1.

The first version should track:

- amount owed
- amount paid
- payment status
- payment instructions

Stripe or PayTo can be added later.

## Design Direction

Buxmate should feel:

- modern
- warm
- trustworthy
- mobile-first
- event-focused
- simple for non-technical users

It should not feel like:

- enterprise SaaS
- banking software
- project management software
- a generic admin dashboard

Visual style:

- warm off-white backgrounds
- charcoal/slate text
- amber/orange/coral accent colour
- large rounded cards
- generous spacing
- clean layouts
- subtle shadows
- minimal animation

The product should feel easy enough for a stressed best man to use quickly, but polished enough that people trust it with private event details and payment tracking.

## Initial Routes

This repository is the authenticated application for `app.buxmate.com`. Marketing lives in a separate repository.

Auth (public):

- /login
- /signup
- /check-email
- /verify-email
- /forgot-password
- /reset-password

Organiser (authenticated):

- / (dashboard)
- /events
- /events/new
- /events/[eventId]
- /events/[eventId]/activities
- /events/[eventId]/guests
- /events/[eventId]/payments
- /events/[eventId]/feed
- /events/[eventId]/settings
- /settings

Guest (public):

- /join/[inviteToken]
- /e/[eventSlug]

## Technical Notes

Stack:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma 7
- Better Auth
- Supabase Postgres
- Supabase Storage
- Zod

Supabase buckets:

- event-covers
- guest-avatars
- event-photos

All storage buckets are private.

Supabase keys:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SECRET_KEY

The secret key must never be exposed client-side.

Analytics (optional):

- NEXT_PUBLIC_GTM_ID — Google Tag Manager container ID (e.g. `GTM-XXXXXXX`). Omit in local development if you do not want GTM loaded. GA4 is configured inside GTM, not in this app.

Prisma 7 is used with:

- prisma.config.ts
- prisma/schema.prisma
- generated/prisma

## Do Not Build Yet

Do not build these in the first foundation phase:

- Stripe
- SMS
- AI planning
- native mobile app
- complex roles
- public events
- refunds
- chat
- full photo upload flow
- calendar sync
