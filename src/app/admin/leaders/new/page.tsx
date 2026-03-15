import { LeaderForm } from "@/components/admin/leader-form";

export default function NewLeaderPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-serif text-3xl text-foreground mb-2">
          Add Leader
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new world leader to the archive.
        </p>
      </div>

      <LeaderForm />
    </div>
  );
}
