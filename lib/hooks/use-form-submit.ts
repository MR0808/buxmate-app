"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type FormSubmitPhase = "idle" | "submitting" | "redirecting";

type SucceedOptions = {
  href?: string;
  refresh?: boolean;
};

export function useFormSubmit() {
  const router = useRouter();
  const [phase, setPhase] = useState<FormSubmitPhase>("idle");

  const start = useCallback(() => setPhase("submitting"), []);
  const fail = useCallback(() => setPhase("idle"), []);

  const succeed = useCallback(
    (options?: SucceedOptions) => {
      if (options?.href) {
        setPhase("redirecting");
        router.push(options.href);
        if (options.refresh !== false) {
          router.refresh();
        }
        return;
      }

      setPhase("idle");
    },
    [router],
  );

  const isBusy = phase !== "idle";
  const isSubmitting = phase === "submitting";
  const isRedirecting = phase === "redirecting";

  const submitLabel = (labels: {
    idle: string;
    submitting: string;
    redirecting?: string;
  }) => {
    if (isRedirecting) {
      return labels.redirecting ?? "Redirecting...";
    }
    if (isSubmitting) {
      return labels.submitting;
    }
    return labels.idle;
  };

  return {
    isBusy,
    isSubmitting,
    isRedirecting,
    start,
    fail,
    succeed,
    submitLabel,
  };
}
