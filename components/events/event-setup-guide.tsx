import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventSetupProgress } from "@/lib/events/setup-progress";

type EventSetupGuideProps = {
  progress: EventSetupProgress;
};

export function EventSetupGuide({ progress }: EventSetupGuideProps) {
  if (progress.isFullySetup) {
    return null;
  }

  const nextStep = progress.steps.find((step) => !step.completed);

  return (
    <section className="buxmate-card overflow-hidden">
      <div className="border-b border-border/60 bg-brand-muted/40 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold">Event setup guide</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {progress.completedCount} of {progress.totalCount} steps complete — follow
              these to get your event ready.
            </p>
          </div>
          <div className="text-sm font-medium text-primary">
            {progress.percentComplete}% complete
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
      </div>

      <ol className="divide-y divide-border/60">
        {progress.steps.map((step) => (
          <li
            key={step.id}
            className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
          >
            <div className="flex gap-3">
              {step.completed ? (
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden
                />
              ) : (
                <Circle
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              )}
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
            {!step.completed ? (
              <Button
                size="sm"
                className="shrink-0 rounded-full normal-case tracking-normal"
                asChild
              >
                <Link href={step.ctaHref}>{step.ctaLabel}</Link>
              </Button>
            ) : null}
          </li>
        ))}
      </ol>

      {nextStep ? (
        <div className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:px-8">
          <p className="text-sm text-muted-foreground">
            Suggested next step:{" "}
            <Link
              href={nextStep.ctaHref}
              className="font-medium text-primary hover:underline"
            >
              {nextStep.title}
            </Link>
          </p>
        </div>
      ) : null}
    </section>
  );
}
