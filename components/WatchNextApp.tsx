"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Answers,
  Excluded,
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

type Phase = "picking" | "loading" | "results" | "error";

/** Titles excluded forever are FIFO-capped so storage can't grow unbounded. */
const EXCLUDED_CAP = 500;

const cap = (list: string[]) => list.slice(-EXCLUDED_CAP);

export function WatchNextApp() {
  const [phase, setPhase] = useState<Phase>("picking");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [pool, setPool] = useState<Title[]>([]);
  const [picks, setPicks] = useState<Picks | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [errorKind, setErrorKind] = useState<"no-token" | "generic">("generic");
  const [loadingLine, setLoadingLine] = useState(0);

  const [excluded, setExcluded] = useLocalStorage<Excluded>("wn:excluded:v1", {
    seen: [],
    dismissed: [],
  });
  const [storedRegion, setStoredRegion] = useLocalStorage<string | null>(
    "wn:region:v1",
    null,
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
        const built = await buildPool(forAnswers, excludedSet());
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
    [excludedSet, gatedPick],
  );

  const start = useCallback(
    (a: Answers) => {
      setAnswers(a);
      void run(a);
    },
    [run],
  );

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
    setPhase("picking");
  }, []);

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

  if (phase === "picking") return <MoodPicker onComplete={start} />;

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-14" role="status">
        <div aria-hidden="true" className="animate-pulse text-4xl">
          🎬
        </div>
        <p className="text-small text-text-muted">
          {copy.loadingLines[loadingLine]}
        </p>
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
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
        <p className="text-small text-text-muted">
          {answers && (
            <>
              {copy.moods[answers.mood].emoji} {copy.moods[answers.mood].label}
              {" · "}
              {copy.times[answers.time].label}
              {" · "}
              {copy.companies[answers.company].label}
            </>
          )}
        </p>
        <Button variant="ghost" onClick={startOver}>
          {copy.startOver}
        </Button>
      </div>

      {exhausted && (
        <div className="mb-5 rounded-md border border-border bg-accent-soft p-3">
          <p className="text-small font-semibold">{copy.exhaustedTitle}</p>
          <p className="text-small text-text-muted">{copy.exhaustedBody}</p>
        </div>
      )}

      {picks ? (
        <>
          <ResultHero
            title={picks.hero}
            details={details[picks.hero.key]}
            providers={providers[`${picks.hero.key}:${region}`]}
            region={region}
            onRegionChange={setStoredRegion}
            onShowAnother={() => void repick(picks.hero.key)}
            onSeen={() => exclude(picks.hero, "seen")}
            onDismiss={() => exclude(picks.hero, "dismissed")}
          />
          <BackupRow backups={picks.backups} onPromote={promote} />
        </>
      ) : (
        <div className="py-8 text-center">
          <p className="text-small text-text-muted">{copy.exhaustedBody}</p>
          <Button variant="primary" className="mt-4" onClick={startOver}>
            {copy.pickAgain}
          </Button>
        </div>
      )}

      <p className="mt-8 border-t border-border pt-3 text-[11px] leading-4 text-text-muted">
        {copy.tmdbAttribution}
      </p>
    </div>
  );
}
