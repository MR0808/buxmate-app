"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileName } from "@/lib/actions/settings";

type ProfileNameFormProps = {
  initialName: string;
};

export function ProfileNameForm({ initialName }: ProfileNameFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const result = await updateProfileName({ name });
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Display name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-xl"
          required
        />
      </div>
      <Button
        type="submit"
        className="rounded-full normal-case tracking-normal"
        disabled={isLoading || name.trim() === initialName}
      >
        {isLoading ? "Saving..." : "Save name"}
      </Button>
    </form>
  );
}
