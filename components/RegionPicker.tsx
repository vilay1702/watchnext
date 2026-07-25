"use client";

import { copy } from "@/lib/copy";
import { REGIONS } from "@/lib/region";

export function RegionPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (region: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-small text-text-muted">
      <span className="sr-only">{copy.regionLabel}</span>
      <span aria-hidden="true">🌍</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm border border-border bg-surface px-2 py-1 text-small text-text focus-visible:outline-2 focus-visible:outline-accent"
      >
        {REGIONS.map((r) => (
          <option key={r.code} value={r.code}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}
