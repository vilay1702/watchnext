"use client";

import { useEffect, useState } from "react";
import type { WatchProviderOption } from "@/lib/types";
import { getRegionProviderOptions, providerLogoUrl } from "@/lib/tmdb";
import { LANGUAGES } from "@/lib/languages";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { RegionPicker } from "@/components/RegionPicker";

/**
 * Optional filters that shape the pool: streaming services (picks become
 * guaranteed-watchable), original language, and region. Collapsed by
 * default — the 3-tap flow stays 3 taps.
 */
export function PreferencesPanel({
  region,
  onRegionChange,
  language,
  onLanguageChange,
  services,
  onServicesChange,
}: {
  region: string;
  onRegionChange: (region: string) => void;
  language: string | null;
  onLanguageChange: (language: string | null) => void;
  services: number[];
  onServicesChange: (services: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<WatchProviderOption[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setOptions(null);
    setFailed(false);
    getRegionProviderOptions(region)
      .then((o) => {
        if (!cancelled) setOptions(o);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, region]);

  const setCount = services.length + (language ? 1 : 0);

  const toggle = (id: number) =>
    onServicesChange(
      services.includes(id)
        ? services.filter((s) => s !== id)
        : [...services, id],
    );

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md px-4 py-3 text-left transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="text-small font-semibold">
          <span aria-hidden="true" className="mr-1.5">
            ⚙️
          </span>
          {copy.preferencesTitle}
        </span>
        <span className="text-small text-text-muted">
          {copy.preferencesSummary(setCount)}
          <span aria-hidden="true" className="ml-2 inline-block">
            {open ? "▴" : "▾"}
          </span>
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <RegionPicker value={region} onChange={onRegionChange} />
            <label className="inline-flex items-center gap-2 text-small text-text-muted">
              <span>{copy.languageLabel}</span>
              <select
                value={language ?? ""}
                onChange={(e) => onLanguageChange(e.target.value || null)}
                className="rounded-sm border border-border bg-surface px-2 py-1 text-small text-text focus-visible:outline-2 focus-visible:outline-accent"
              >
                <option value="">{copy.languageAny}</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-small font-semibold">{copy.servicesLabel}</p>
              {services.length > 0 && (
                <Button variant="ghost" onClick={() => onServicesChange([])}>
                  {copy.clearServices}
                </Button>
              )}
            </div>
            <p className="mb-3 text-small text-text-muted">
              {copy.servicesHint}
            </p>
            {failed ? (
              <p className="text-small text-text-muted">
                {copy.servicesError}
              </p>
            ) : options === null ? (
              <p className="animate-pulse text-small text-text-muted">
                {copy.servicesLoading}
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {options.map((p) => {
                  const active = services.includes(p.id);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        aria-pressed={active}
                        className={`flex items-center gap-1.5 rounded-sm border py-1 pl-1 pr-2 text-small transition focus-visible:outline-2 focus-visible:outline-accent ${
                          active
                            ? "border-accent bg-accent-soft font-semibold text-accent"
                            : "border-border bg-surface hover:border-accent/40"
                        }`}
                      >
                        {p.logoPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={providerLogoUrl(p.logoPath)!}
                            alt=""
                            width={20}
                            height={20}
                            className="rounded-[4px]"
                          />
                        ) : null}
                        {p.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
