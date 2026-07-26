"use client";

import { useState } from "react";
import type { Answers, Company, Mood, TimeChoice } from "@/lib/types";
import { copy } from "@/lib/copy";

/**
 * The whole input surface: three taps, no typing.
 * vibe → time → company, then hands the answers up.
 *
 * `editSingle` + `startStep` turn it into a one-step editor: the results
 * screen's answer chips reopen just that step, keep the other answers,
 * and complete immediately on selection.
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
  initial,
  startStep = 0,
  editSingle = false,
}: {
  onComplete: (answers: Answers) => void;
  initial?: Answers;
  startStep?: 0 | 1 | 2;
  editSingle?: boolean;
}) {
  const [step, setStep] = useState<number>(startStep);
  const [mood, setMood] = useState<Mood | null>(initial?.mood ?? null);
  const [time, setTime] = useState<TimeChoice | null>(initial?.time ?? null);

  // Breadcrumb of answered steps — progress you can see and tap back to.
  const crumbs: { label: string; step: 0 | 1 }[] = [];
  if (mood && step > 0)
    crumbs.push({
      label: `${copy.moods[mood].emoji} ${copy.moods[mood].label}`,
      step: 0,
    });
  if (time && step > 1)
    crumbs.push({
      label: `${copy.times[time].emoji} ${copy.times[time].label}`,
      step: 1,
    });

  const finish = (partial: Partial<Answers>) => {
    const merged: Answers = {
      mood: partial.mood ?? mood ?? initial!.mood,
      time: partial.time ?? time ?? initial!.time,
      company: partial.company ?? initial!.company,
    };
    onComplete(merged);
  };

  return (
    <div className="animate-rise-in">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="font-display text-h3 font-semibold">{STEPS[step]}</h2>
        {!editSingle && (
          <div className="flex flex-wrap items-center gap-2">
            {crumbs.map((c) => (
              <button
                key={c.step}
                type="button"
                onClick={() => setStep(c.step)}
                aria-label={copy.changeAnswer(c.label)}
                className="rounded-sm border border-border bg-surface px-2 py-1 text-small text-text-muted transition hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
              >
                {c.label}
              </button>
            ))}
            <span className="text-small text-text-muted" aria-live="polite">
              {step + 1} of 3
            </span>
          </div>
        )}
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
                if (editSingle) finish({ mood: m });
                else setStep(1);
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
                if (editSingle) finish({ time: t });
                else setStep(2);
              }}
            />
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COMPANIES.map((c) => (
            <OptionButton
              key={c}
              emoji={copy.companies[c].emoji}
              label={copy.companies[c].label}
              onClick={() => {
                if (editSingle) finish({ company: c });
                else if (mood && time) onComplete({ mood, time, company: c });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
