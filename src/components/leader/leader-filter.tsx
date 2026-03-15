"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LeaderFilterProps = {
  countries: string[];
};

export function LeaderFilter({ countries }: LeaderFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCountry = searchParams.get("country") ?? "";

  const handleChange = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "__all__") {
        params.set("country", value);
      } else {
        params.delete("country");
      }
      router.push(`/leaders?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <Select
      value={currentCountry || "__all__"}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All countries" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All countries</SelectItem>
        {countries.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
