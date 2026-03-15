"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { COUNTRIES, LANGUAGES } from "@/lib/constants";
import { Loader2, Save } from "lucide-react";

export function LeaderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState("");
  const [nameLocal, setNameLocal] = useState("");
  const [slug, setSlug] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [bio, setBio] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  }

  function handleCountryChange(code: string) {
    setCountryCode(code);
    const match = COUNTRIES.find((c) => c.code === code);
    if (match) {
      setCountry(match.name);
    }
  }

  function toggleLanguage(langCode: string) {
    setSelectedLanguages((prev) =>
      prev.includes(langCode)
        ? prev.filter((l) => l !== langCode)
        : [...prev, langCode]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (!country.trim()) newErrors.country = "Country is required";
    if (!countryCode.trim() || countryCode.length !== 2)
      newErrors.countryCode = "2-letter country code is required";
    if (!role.trim()) newErrors.role = "Role is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      nameLocal: nameLocal.trim() || undefined,
      slug: slug.trim(),
      country: country.trim(),
      countryCode: countryCode.toUpperCase(),
      role: role.trim(),
      organization: organization.trim() || undefined,
      bio: bio.trim() || undefined,
      languages: selectedLanguages,
      photoUrl: photoUrl.trim() || undefined,
    };

    setIsSubmitting(true);

    try {
      console.log("Leader payload:", payload);

      const res = await fetch("/api/leaders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error ?? `Failed to create leader (${res.status})`
        );
      }

      alert("Leader created successfully.");
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error ? err.message : "Failed to create leader.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Emmanuel Macron"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="nameLocal"
            className="text-sm font-medium text-foreground"
          >
            Name (Local Script)
          </label>
          <Input
            id="nameLocal"
            value={nameLocal}
            onChange={(e) => setNameLocal(e.target.value)}
            placeholder="Optional"
          />
        </fieldset>
      </div>

      {/* Slug */}
      <fieldset className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium text-foreground">
          Slug <span className="text-destructive">*</span>
        </label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="emmanuel-macron"
          className="font-mono text-sm"
        />
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug}</p>
        )}
      </fieldset>

      {/* Country */}
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <label
            htmlFor="countryCode"
            className="text-sm font-medium text-foreground"
          >
            Country <span className="text-destructive">*</span>
          </label>
          <select
            id="countryCode"
            value={countryCode}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.countryCode && (
            <p className="text-xs text-destructive">{errors.countryCode}</p>
          )}
          {errors.country && (
            <p className="text-xs text-destructive">{errors.country}</p>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-foreground">
            Role <span className="text-destructive">*</span>
          </label>
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. President"
          />
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role}</p>
          )}
        </fieldset>
      </div>

      {/* Organization */}
      <fieldset className="space-y-2">
        <label
          htmlFor="organization"
          className="text-sm font-medium text-foreground"
        >
          Organization
        </label>
        <Input
          id="organization"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="e.g. Government of France"
        />
      </fieldset>

      {/* Bio */}
      <fieldset className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium text-foreground">
          Bio
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief biography..."
          className="min-h-[100px]"
          rows={4}
        />
      </fieldset>

      {/* Languages */}
      <fieldset className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Languages Spoken
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.slice(0, 20).map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => toggleLanguage(lang.code)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedLanguages.includes(lang.code)
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
        {selectedLanguages.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Selected: {selectedLanguages.join(", ")}
          </p>
        )}
      </fieldset>

      {/* Photo URL */}
      <fieldset className="space-y-2">
        <label
          htmlFor="photoUrl"
          className="text-sm font-medium text-foreground"
        >
          Photo URL
        </label>
        <Input
          id="photoUrl"
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://..."
        />
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
          Create Leader
        </Button>
      </div>
    </form>
  );
}
