"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LANGUAGES, TAGS } from "@/lib/constants";
import { Loader2, Save } from "lucide-react";

type LeaderOption = {
  id: string;
  name: string;
  country: string;
};

export function SpeechForm() {
  const [leaders, setLeaders] = useState<LeaderOption[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [leaderId, setLeaderId] = useState("");
  const [title, setTitle] = useState("");
  const [titleOriginal, setTitleOriginal] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");
  const [occasion, setOccasion] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [originalLang, setOriginalLang] = useState("en");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoEmbedId, setVideoEmbedId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const res = await fetch("/api/leaders");
        if (res.ok) {
          const data = await res.json();
          setLeaders(data.data ?? data ?? []);
        }
      } catch {
        // Leaders will show as empty
      } finally {
        setLoadingLeaders(false);
      }
    }
    fetchLeaders();
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!leaderId) newErrors.leaderId = "Leader is required";
    if (!title.trim()) newErrors.title = "Title is required";
    if (!sourceUrl.trim()) newErrors.sourceUrl = "Source URL is required";
    if (!deliveredAt) newErrors.deliveredAt = "Date is required";
    if (!transcript.trim()) newErrors.transcript = "Transcript is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build paragraphs from transcript
    const paragraphs = transcript
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text, index) => ({ index, text }));

    const payload = {
      leaderId,
      title: title.trim(),
      titleOriginal: titleOriginal.trim() || undefined,
      sourceUrl: sourceUrl.trim(),
      sourceLabel: sourceLabel.trim() || undefined,
      deliveredAt: new Date(deliveredAt).toISOString(),
      occasion: occasion.trim() || undefined,
      venue: venue.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      originalLang,
      videoUrl: videoUrl.trim() || undefined,
      videoEmbedId: videoEmbedId.trim() || undefined,
      tags: selectedTags,
      paragraphs,
    };

    setIsSubmitting(true);

    try {
      // Placeholder: POST to /api/speeches
      console.log("Speech payload:", payload);

      const res = await fetch("/api/speeches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Failed to create speech (${res.status})`);
      }

      // On success, redirect or show success
      alert("Speech created successfully.");
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error ? err.message : "Failed to create speech.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Leader */}
      <fieldset className="space-y-2">
        <label
          htmlFor="leaderId"
          className="text-sm font-medium text-foreground"
        >
          Leader <span className="text-destructive">*</span>
        </label>
        <select
          id="leaderId"
          value={leaderId}
          onChange={(e) => setLeaderId(e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">
            {loadingLeaders ? "Loading leaders..." : "Select a leader"}
          </option>
          {leaders.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.country})
            </option>
          ))}
        </select>
        {errors.leaderId && (
          <p className="text-xs text-destructive">{errors.leaderId}</p>
        )}
      </fieldset>

      {/* Title */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Address to the UN General Assembly"
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="titleOriginal"
            className="text-sm font-medium text-foreground"
          >
            Title (Original Language)
          </label>
          <Input
            id="titleOriginal"
            value={titleOriginal}
            onChange={(e) => setTitleOriginal(e.target.value)}
            placeholder="Optional"
          />
        </fieldset>
      </div>

      {/* Source */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <label
            htmlFor="sourceUrl"
            className="text-sm font-medium text-foreground"
          >
            Source URL <span className="text-destructive">*</span>
          </label>
          <Input
            id="sourceUrl"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
          />
          {errors.sourceUrl && (
            <p className="text-xs text-destructive">{errors.sourceUrl}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="sourceLabel"
            className="text-sm font-medium text-foreground"
          >
            Source Label
          </label>
          <Input
            id="sourceLabel"
            value={sourceLabel}
            onChange={(e) => setSourceLabel(e.target.value)}
            placeholder='e.g. "White House Press Office"'
          />
        </fieldset>
      </div>

      {/* Date + Language */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <label
            htmlFor="deliveredAt"
            className="text-sm font-medium text-foreground"
          >
            Date Delivered <span className="text-destructive">*</span>
          </label>
          <Input
            id="deliveredAt"
            type="date"
            value={deliveredAt}
            onChange={(e) => setDeliveredAt(e.target.value)}
          />
          {errors.deliveredAt && (
            <p className="text-xs text-destructive">{errors.deliveredAt}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="originalLang"
            className="text-sm font-medium text-foreground"
          >
            Original Language
          </label>
          <select
            id="originalLang"
            value={originalLang}
            onChange={(e) => setOriginalLang(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </fieldset>
      </div>

      {/* Occasion + Venue */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <label
            htmlFor="occasion"
            className="text-sm font-medium text-foreground"
          >
            Occasion
          </label>
          <Input
            id="occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="e.g. 78th UN General Assembly"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="venue" className="text-sm font-medium text-foreground">
            Venue
          </label>
          <Input
            id="venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. UN Headquarters"
          />
        </fieldset>
      </div>

      {/* City + Country */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium text-foreground">
            City
          </label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. New York"
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="country"
            className="text-sm font-medium text-foreground"
          >
            Country
          </label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. United States"
          />
        </fieldset>
      </div>

      {/* Video */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <label
            htmlFor="videoUrl"
            className="text-sm font-medium text-foreground"
          >
            Video URL
          </label>
          <Input
            id="videoUrl"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
          />
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="videoEmbedId"
            className="text-sm font-medium text-foreground"
          >
            Video Embed ID
          </label>
          <Input
            id="videoEmbedId"
            value={videoEmbedId}
            onChange={(e) => setVideoEmbedId(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
          />
        </fieldset>
      </div>

      {/* Tags */}
      <fieldset className="space-y-3">
        <label className="text-sm font-medium text-foreground">Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Transcript */}
      <fieldset className="space-y-2">
        <label
          htmlFor="transcript"
          className="text-sm font-medium text-foreground"
        >
          Transcript <span className="text-destructive">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Paste the full transcript. Separate paragraphs with blank lines.
        </p>
        <Textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste the full transcript here..."
          className="min-h-[300px] font-mono text-sm leading-relaxed"
          rows={20}
        />
        {errors.transcript && (
          <p className="text-xs text-destructive">{errors.transcript}</p>
        )}
        {transcript.trim() && (
          <p className="text-xs text-muted-foreground">
            {transcript.split(/\n\s*\n/).filter((p) => p.trim()).length}{" "}
            paragraphs detected
          </p>
        )}
      </fieldset>

      {/* Submit error */}
      {errors.submit && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errors.submit}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Create Speech
        </Button>
      </div>
    </form>
  );
}
