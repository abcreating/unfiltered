import { SpeechForm } from "@/components/admin/speech-form";

export default function NewSpeechPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-serif text-3xl text-foreground mb-2">
          Add Speech
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new speech transcript to the archive.
        </p>
      </div>

      <SpeechForm />
    </div>
  );
}
