"use client";

import { useState } from "react";
import type { Answers, Company, Mood, TimeChoice } from "@/lib/types";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/Button";

/**
 * The whole input surface: three taps, no typing.
 * vibe → time → company, then hands the answers up.
 */

const MOODS = Object.keys(copy.moods) as Mood[];
const TIMES = Object.keys(copy.times) as TimeChoice[];
const COMPANIES = Object.keys(copy.companies) as Company[];

const STEPS = [copy.stepVibe, copy.stepTime, copy.stepCompany];

function OptionButton({
  emoji,
  label,
  hint,
  onClick,
}: {
  emoji: string;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-surface p-4 text-center shadow-card transition hover:border-accent/50 hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98]"
    >
      <span aria-hidden="true" className="text-3xl">
        {emoji}
      </span>
      <span className="text-small font-semibold">{label}</span>
      {hint && <span className="text-small text-text-muted">{hint}</span>}
    </button>
  );
}

export function MoodPicker({
  onComplete,
}: {
  onComplete: (answers: Answers) => void;
}) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<Mood | null>(null);
  const [time, setTime] = useState<TimeChoice | null>(null);

  return (
    <div className="animate-rise-in">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-h3 font-semibold">{STEPS[step]}</h2>
        <div className="flex items-center gap-3">
          <span className="text-small text-text-muted" aria-live="polite">
            {step + 1} of 3
          </span>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              {copy.back}
            </Button>
          )}
        </div>
      </div>

      {step === 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {MOODS.map((m) => (
            <OptionButton
              key={m}
              emoji={copy.moods[m].emoji}
              label={copy.moods[m].label}
              onClick={() => {
                setMood(m);
                setStep(1);
              }}
            />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TIMES.map((t) => (
            <OptionButton
              key={t}
              emoji={copy.times[t].emoji}
              label={copy.times[t].label}
              hint={copy.times[t].hint}
              onClick={() => {
                setTime(t);
                setStep(2);
              }}
            />
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {COMPANIES.map((c) => (
            <OptionButton
              key={c}
              emoji={copy.companies[c].emoji}
              label={copy.companies[c].label}
              onClick={() => {
                if (mood && time) onComplete({ mood, time, company: c });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
