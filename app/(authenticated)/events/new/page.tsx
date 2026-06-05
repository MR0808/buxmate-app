import type { Metadata } from "next";
import { CreateEventForm } from "@/components/events/create-event-form";

export const metadata: Metadata = {
  title: "Create event",
};

export default function NewEventPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold">Create event</h1>
        <p className="mt-2 text-muted-foreground">
          Set up the basics — add activities and guests next.
        </p>
      </div>

      <div className="buxmate-card p-6 sm:p-8">
        <CreateEventForm />
      </div>
    </main>
  );
}
