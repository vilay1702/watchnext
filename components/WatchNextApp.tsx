"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Answers,
  Excluded,
  HistoryRecord,
  Prefs,
  RegionProviders,
  Title,
  TitleDetails,
} from "@/lib/types";
import {
  getDetails,
  getTvUsRating,
  getWatchProviders,
  hasToken,
  TmdbError,
} from "@/lib/tmdb";
import { buildPool, pickTitles, type Picks } from "@/lib/engine";
import { detectRegion } from "@/lib/region";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/Button";
import { MoodPicker } from "@/components/MoodPicker";
import { ResultHero } from "@/components/ResultHero";
import { BackupRow } from "@/components/BackupRow";
import { HistoryPanel } from "@/components/HistoryPanel";
import { PreferencesPanel } from "@/components/PreferencesPanel";

type Phase = "picking" | "loading" | "results" | "error";

/** Titles excluded forever are FIFO-capped so storage can't grow unbounded. */
const EXCLUDED_CAP = 500;
const HISTORY_LIMIT = 50;

const cap = (list: string[]) => list.slice(-EXCLUDED_CAP);

export function WatchNextApp() {
  const [phase, setPhase] = useState<Phase>("picking");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [pool, setPool] = useState<Title[]>([]);
  const [picks, setPicks] = useState<Picks | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [errorKind, setErrorKind] = useState<"no-token" | "generic">("generic");
  const [loadingLine, setLoadingLine] = useState(0);
  /** Which single answer is being edited from the results chips. */
  const [editStep, setEditStep] = useState<0 | 1 | 2 | null>(null);

  const [excluded, setExcluded] = useLocalStorage<Excluded>("wn:excluded:v1", {
    seen: [],
    dismissed: [],
  });
  const [storedRegion, setStoredRegion] = useLocalStorage<string | null>(
    "wn:region:v1",
    null,
  );
  const [history, setHistory] = useLocalStorage<HistoryRecord[]>(
    "wn:history:v1",
    [],
  );
  const [services, setServices] = useLocalStorage<number[]>(
    "wn:services:v1",
    [],
  );
  // Defaults to English; "Any language" is an explicit choice.
  const [language, setLanguage] = useLocalStorage<string | null>(
    "wn:lang:v1",
    "en",
  );
  /** Last completed answers — powers the one-tap "same as last time". */
  const [lastAnswers, setLastAnswers] = useLocalStorage<Answers | null>(
    "wn:answers:v1",
    null,
  );
  const [nudgeDismissed, setNudgeDismissed] = useLocalStorage<boolean>(
    "wn:nudge:v1",
    false,
  );
  const [detectedRegion, setDetectedRegion] = useState("US");
  useEffect(() => setDetectedRegion(detectRegion()), []);
  const region = storedRegion ?? detectedRegion;

  // Lazily fetched per displayed title; session-only caches.
  const [details, setDetails] = useState<Record<string, TitleDetails>>({});
  const [providers, setProviders] = useState<
    Record<string, RegionProviders | null>
  >({});
  const providersCache = useRef(new Map<string, RegionProviders | null>());
  const ratingsCache = useRef(new Map<string, string | null>());
  /** TV-MA titles blocked by the family gate — session only. */
  const blockedRef = useRef(new Set<string>());
  /** Heroes already shown this session — never repeated until exhausted. */
  const shownRef = useRef(new Set<string>());
  const requestSeq = useRef(0);

  const excludedSet = useCallback(
    () => new Set([...excluded.seen, ...excluded.dismissed]),
    [excluded],
  );

  /** Family + series: drop TV-MA picks (discover/tv ignores certification). */
  const gatedPick = useCallback(
    async (fromPool: Title[], forAnswers: Answers): Promise<Picks | null> => {
      const blocked = new Set([...blockedRef.current, ...excludedSet()]);
      for (;;) {
        const p = pickTitles(fromPool, blocked, shownRef.current);
        if (!p) return null;
        if (forAnswers.company !== "family" || forAnswers.time !== "series")
          return p;
        const all = [p.hero, ...p.backups];
        const ratings = await Promise.all(
          all.map(async (t) => {
            const cached = ratingsCache.current.get(t.key);
            if (cached !== undefined) return cached;
            const r = await getTvUsRating(t.id).catch(() => null);
            ratingsCache.current.set(t.key, r);
            return r;
          }),
        );
        const adult = all.filter((_, i) => ratings[i] === "TV-MA");
        if (adult.length === 0) return p;
        adult.forEach((t) => {
          blockedRef.current.add(t.key);
          blocked.add(t.key);
        });
      }
    },
    [excludedSet],
  );

  const run = useCallback(
    async (forAnswers: Answers) => {
      const seq = ++requestSeq.current;
      setPhase("loading");
      setLoadingLine((n) => (n + 1) % copy.loadingLines.length);
      setExhausted(false);
      shownRef.current = new Set();
      blockedRef.current = new Set();
      try {
        const prefs: Prefs = { region, providers: services, language };
        // Shown in the last two weeks → de-prioritized, not excluded.
        const twoWeeksAgo = Date.now() - 14 * 86_400_000;
        const recentKeys = new Set(
          history.filter((r) => r.at >= twoWeeksAgo).map((r) => r.key),
        );
        const built = await buildPool(
          forAnswers,
          excludedSet(),
          prefs,
          recentKeys,
        );
        const p = await gatedPick(built.titles, forAnswers);
        if (seq !== requestSeq.current) return;
        setPool(built.titles);
        if (!p) {
          // Everything is excluded/blocked — nothing left even fresh.
          setExhausted(true);
          setPicks(null);
        } else {
          setPicks(p);
        }
        setPhase("results");
      } catch (e) {
        if (seq !== requestSeq.current) return;
        setErrorKind(
          e instanceof TmdbError && e.kind === "no-token"
            ? "no-token"
            : "generic",
        );
        setPhase("error");
      }
    },
    [excludedSet, gatedPick, region, services, language, history],
  );

  const start = useCallback(
    (a: Answers) => {
      setAnswers(a);
      setLastAnswers(a);
      setEditStep(null);
      void run(a);
    },
    [run, setLastAnswers],
  );

  // Rotate the loading lines so a slow fetch feels alive, not stuck.
  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(
      () => setLoadingLine((n) => (n + 1) % copy.loadingLines.length),
      1600,
    );
    return () => clearInterval(id);
  }, [phase]);

  const repick = useCallback(
    async (markShown?: string) => {
      if (!answers) return;
      if (markShown) shownRef.current.add(markShown);
      let p = await gatedPick(pool, answers);
      if (!p) {
        // Session exhausted: honest note, then reopen the shortlist
        // (permanent exclusions stay excluded).
        shownRef.current = new Set();
        setExhausted(true);
        p = await gatedPick(pool, answers);
      }
      setPicks(p);
    },
    [answers, pool, gatedPick],
  );

  const exclude = useCallback(
    (title: Title, kind: keyof Excluded) => {
      setExcluded((prev) => ({
        ...prev,
        [kind]: cap([...prev[kind].filter((k) => k !== title.key), title.key]),
      }));
      if (picks?.hero.key === title.key) {
        void repick();
      } else if (picks) {
        // A backup was excluded — just drop it from the row.
        setPicks({
          hero: picks.hero,
          backups: picks.backups.filter((b) => b.key !== title.key),
        });
      }
    },
    [picks, repick, setExcluded],
  );

  const promote = useCallback(
    (title: Title) => {
      if (!picks) return;
      shownRef.current.add(picks.hero.key);
      setPicks({
        hero: title,
        backups: [
          ...picks.backups.filter((b) => b.key !== title.key),
          picks.hero,
        ],
      });
      setExhausted(false);
    },
    [picks],
  );

  const startOver = useCallback(() => {
    requestSeq.current++;
    setAnswers(null);
    setPicks(null);
    setPool([]);
    setExhausted(false);
    setEditStep(null);
    setPhase("picking");
  }, []);

  // Every hero shown lands in the persisted history (newest first, deduped,
  // capped). Keyed on the hero so promote/re-pick paths all record.
  const heroKey = picks?.hero.key;
  useEffect(() => {
    if (!picks) return;
    const h = picks.hero;
    setHistory((prev) => {
      if (prev[0]?.key === h.key) return prev;
      return [
        {
          key: h.key,
          name: h.name,
          year: h.year,
          mediaType: h.mediaType,
          posterPath: h.posterPath,
          at: Date.now(),
        },
        ...prev.filter((r) => r.key !== h.key),
      ].slice(0, HISTORY_LIMIT);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroKey, setHistory]);

  // Lazy enrichment: details for every displayed title (runtime / seasons),
  // providers for the active region. Caches make repeat views free.
  const displayed = picks ? [picks.hero, ...picks.backups] : [];
  const displayedKeys = displayed.map((t) => t.key).join(",");
  useEffect(() => {
    if (!picks) return;
    let cancelled = false;
    for (const t of [picks.hero, ...picks.backups]) {
      if (!(t.key in details)) {
        getDetails(t)
          .then((d) => {
            if (!cancelled) setDetails((prev) => ({ ...prev, [t.key]: d }));
          })
          .catch(() => {});
      }
      const cacheKey = `${t.key}:${region}`;
      if (!providersCache.current.has(cacheKey)) {
        getWatchProviders(t, region)
          .then((p) => {
            providersCache.current.set(cacheKey, p);
            if (!cancelled)
              setProviders((prev) => ({ ...prev, [cacheKey]: p }));
          })
          .catch(() => {
            providersCache.current.set(cacheKey, null);
            if (!cancelled)
              setProviders((prev) => ({ ...prev, [cacheKey]: null }));
          });
      }
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedKeys, region]);

  /* ---------- render ---------- */

  if (!hasToken()) {
    return (
      <div className="py-10 text-center">
        <div aria-hidden="true" className="text-4xl">
          🎬
        </div>
        <h2 className="mt-3 font-display text-h3 font-semibold">
          {copy.noTokenTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-small text-text-muted">
          {copy.noTokenBody}
        </p>
      </div>
    );
  }

  const historyPanel = history.length > 0 && (
    <div className="mt-10 border-t border-border pt-5">
      <HistoryPanel history={history} onClear={() => setHistory([])} />
    </div>
  );

  const preferencesPanel = (
    <PreferencesPanel
      region={region}
      onRegionChange={setStoredRegion}
      language={language}
      onLanguageChange={setLanguage}
      services={services}
      onServicesChange={setServices}
    />
  );

  if (phase === "picking") {
    const editing = editStep !== null && answers !== null;
    return (
      <div>
        {!editing && lastAnswers && (
          <button
            type="button"
            onClick={() => start(lastAnswers)}
            className="mb-5 flex w-full items-center justify-between gap-2 rounded-md border border-accent/40 bg-accent-soft px-4 py-3 text-left transition hover:border-accent focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.99]"
          >
            <span className="text-small font-semibold text-accent">
              ▶ {copy.sameAsLastTime}
            </span>
            <span className="text-small text-text-muted">
              {copy.moods[lastAnswers.mood].emoji}{" "}
              {copy.moods[lastAnswers.mood].label} ·{" "}
              {copy.times[lastAnswers.time].label} ·{" "}
              {copy.companies[lastAnswers.company].label}
            </span>
          </button>
        )}
        <MoodPicker
          key={editing ? `edit-${editStep}` : "full"}
          onComplete={start}
          initial={editing ? answers : undefined}
          startStep={editing ? editStep : 0}
          editSingle={editing}
        />
        <div className="mt-8">{preferencesPanel}</div>
        {historyPanel}
      </div>
    );
  }

  if (phase === "loading") {
    // Skeleton in the result layout — spatial continuity into the reveal.
    return (
      <div role="status" aria-label={copy.loadingLines[loadingLine]}>
        <div className="grid gap-5 rounded-lg border border-border p-4 sm:grid-cols-[minmax(0,180px)_1fr] sm:p-6">
          <div className="mx-auto w-40 sm:w-full">
            <div className="aspect-[2/3] animate-pulse rounded-md bg-border/60" />
          </div>
          <div className="min-w-0 space-y-3">
            <div className="h-4 w-28 animate-pulse rounded-sm bg-border/60" />
            <div className="h-7 w-3/5 animate-pulse rounded-sm bg-border/60" />
            <div className="h-4 w-2/5 animate-pulse rounded-sm bg-border/60" />
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-full animate-pulse rounded-sm bg-border/50" />
              <div className="h-3.5 w-11/12 animate-pulse rounded-sm bg-border/50" />
              <div className="h-3.5 w-4/5 animate-pulse rounded-sm bg-border/50" />
            </div>
            <p className="pt-3 text-small text-text-muted" aria-live="polite">
              {copy.loadingLines[loadingLine]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    const noToken = errorKind === "no-token";
    return (
      <div className="py-10 text-center">
        <div aria-hidden="true" className="text-4xl">
          🎬💥
        </div>
        <h2 className="mt-3 font-display text-h3 font-semibold">
          {noToken ? copy.noTokenTitle : copy.errorTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-small text-text-muted">
          {noToken ? copy.noTokenBody : copy.errorBody}
        </p>
        {!noToken && answers && (
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => void run(answers)}
          >
            {copy.tryAgain}
          </Button>
        )}
      </div>
    );
  }

  // results
  const answerChips: { label: string; step: 0 | 1 | 2 }[] = answers
    ? [
        {
          label: `${copy.moods[answers.mood].emoji} ${copy.moods[answers.mood].label}`,
          step: 0,
        },
        { label: copy.times[answers.time].label, step: 1 },
        { label: copy.companies[answers.company].label, step: 2 },
      ]
    : [];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
        {/* Tappable answer chips — change one answer without starting over */}
        <div className="flex flex-wrap items-center gap-2">
          {answerChips.map((c) => (
            <button
              key={c.step}
              type="button"
              onClick={() => {
                setEditStep(c.step);
                setPhase("picking");
              }}
              aria-label={copy.changeAnswer(c.label)}
              className="rounded-sm border border-border bg-surface px-2 py-1 text-small text-text-muted transition hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              {c.label} <span aria-hidden="true">▾</span>
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={startOver}>
          {copy.startOver}
        </Button>
      </div>

      {exhausted && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-accent-soft p-3">
          <div>
            <p className="text-small font-semibold">{copy.exhaustedTitle}</p>
            <p className="text-small text-text-muted">{copy.exhaustedBody}</p>
          </div>
          <Button variant="primary" onClick={startOver}>
            {copy.tryDifferentVibe}
          </Button>
        </div>
      )}

      {picks ? (
        <>
          <ResultHero
            title={picks.hero}
            answers={answers!}
            details={details[picks.hero.key]}
            providers={providers[`${picks.hero.key}:${region}`]}
            region={region}
            onRegionChange={setStoredRegion}
            onShowAnother={() => void repick(picks.hero.key)}
            onSeen={() => exclude(picks.hero, "seen")}
            onDismiss={() => exclude(picks.hero, "dismissed")}
          />
          <BackupRow
            backups={picks.backups}
            heroGenreIds={picks.hero.genreIds}
            onPromote={promote}
          />
        </>
      ) : (
        <div className="py-8 text-center">
          <p className="text-small text-text-muted">{copy.exhaustedBody}</p>
          <Button variant="primary" className="mt-4" onClick={startOver}>
            {copy.pickAgain}
          </Button>
        </div>
      )}

      {/* One-time nudge toward the services filter, shown where its value
          is obvious — right after seeing where a pick streams. */}
      {services.length === 0 && !nudgeDismissed && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
          <p className="text-small text-text-muted">{copy.servicesNudge}</p>
          <Button variant="ghost" onClick={() => setNudgeDismissed(true)}>
            {copy.dismissNudge}
          </Button>
        </div>
      )}

      <div className="mt-6">{preferencesPanel}</div>

      {historyPanel}

      <p className="mt-8 border-t border-border pt-3 text-[11px] leading-4 text-text-muted">
        {copy.tmdbAttribution}
      </p>
    </div>
  );
}
