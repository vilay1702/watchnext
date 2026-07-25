"use client";

import type { Provider, RegionProviders } from "@/lib/types";
import { providerLogoUrl } from "@/lib/tmdb";
import { copy } from "@/lib/copy";

function BadgeList({ providers }: { providers: Provider[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {providers.map((p) => (
        <li
          key={p.id}
          className="flex items-center gap-1.5 rounded-sm border border-border bg-surface py-1 pl-1 pr-2"
          title={p.name}
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
          <span className="text-small">{p.name}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Streaming availability for one title. The JustWatch attribution lives
 * here by design — it must appear wherever provider data is shown.
 */
export function ProviderBadges({
  providers,
  region,
}: {
  /** undefined = still loading, null = no data for this region */
  providers: RegionProviders | null | undefined;
  region: string;
}) {
  if (providers === undefined) {
    return (
      <p className="text-small text-text-muted">{copy.providersLoading}</p>
    );
  }

  const empty =
    providers === null ||
    (providers.flatrate.length === 0 &&
      providers.rent.length === 0 &&
      providers.buy.length === 0);

  return (
    <div className="space-y-2">
      {empty ? (
        <p className="text-small text-text-muted">{copy.noProviders(region)}</p>
      ) : (
        <>
          {providers.flatrate.length > 0 && (
            <BadgeList providers={providers.flatrate} />
          )}
          {(providers.rent.length > 0 || providers.buy.length > 0) && (
            <details className="text-small text-text-muted">
              <summary className="cursor-pointer select-none hover:text-text">
                {copy.rentOrBuy}
              </summary>
              <div className="mt-2">
                <BadgeList
                  providers={[
                    ...providers.rent,
                    ...providers.buy.filter(
                      (b) => !providers.rent.some((r) => r.id === b.id),
                    ),
                  ]}
                />
              </div>
            </details>
          )}
          {providers.link && (
            <a
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-small text-accent underline underline-offset-2 hover:text-accent-hover"
            >
              {copy.whereToWatch} →
            </a>
          )}
        </>
      )}
      <p className="text-[11px] leading-4 text-text-muted">
        {copy.justWatchAttribution}
      </p>
    </div>
  );
}
