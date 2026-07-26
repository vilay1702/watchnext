/** Streaming-region handling: auto-detect from the browser locale,
    overridable via RegionPicker (persisted under wn:region:v1). */

export const REGIONS: { code: string; name: string }[] = [
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NO", name: "Norway" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Türkiye" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

const KNOWN = new Set(REGIONS.map((r) => r.code));

/**
 * IANA timezone → region for the regions this tool supports. The device
 * timezone reflects where the user actually is; the browser locale often
 * stays en-US regardless of location, so it's only the fallback.
 */
const TZ_REGION: Record<string, string> = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Europe/Vienna": "AT",
  "Europe/Brussels": "BE",
  "America/Sao_Paulo": "BR",
  "America/Bahia": "BR",
  "America/Fortaleza": "BR",
  "America/Manaus": "BR",
  "America/Recife": "BR",
  "America/Belem": "BR",
  "America/Cuiaba": "BR",
  "America/Campo_Grande": "BR",
  "America/Toronto": "CA",
  "America/Montreal": "CA",
  "America/Vancouver": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "America/Regina": "CA",
  "America/St_Johns": "CA",
  "America/Santiago": "CL",
  "Pacific/Easter": "CL",
  "America/Bogota": "CO",
  "Europe/Prague": "CZ",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Busingen": "DE",
  "Europe/Athens": "GR",
  "Asia/Hong_Kong": "HK",
  "Asia/Jakarta": "ID",
  "Asia/Makassar": "ID",
  "Asia/Jayapura": "ID",
  "Asia/Pontianak": "ID",
  "Europe/Dublin": "IE",
  "Asia/Jerusalem": "IL",
  "Asia/Tel_Aviv": "IL",
  "Europe/Rome": "IT",
  "Asia/Tokyo": "JP",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Kuching": "MY",
  "America/Mexico_City": "MX",
  "America/Cancun": "MX",
  "America/Monterrey": "MX",
  "America/Tijuana": "MX",
  "America/Chihuahua": "MX",
  "America/Merida": "MX",
  "America/Hermosillo": "MX",
  "Europe/Amsterdam": "NL",
  "Pacific/Auckland": "NZ",
  "Pacific/Chatham": "NZ",
  "Europe/Oslo": "NO",
  "Asia/Manila": "PH",
  "Europe/Warsaw": "PL",
  "Europe/Lisbon": "PT",
  "Atlantic/Madeira": "PT",
  "Atlantic/Azores": "PT",
  "Asia/Riyadh": "SA",
  "Asia/Singapore": "SG",
  "Africa/Johannesburg": "ZA",
  "Asia/Seoul": "KR",
  "Europe/Madrid": "ES",
  "Atlantic/Canary": "ES",
  "Africa/Ceuta": "ES",
  "Europe/Stockholm": "SE",
  "Europe/Zurich": "CH",
  "Asia/Bangkok": "TH",
  "Europe/Istanbul": "TR",
  "Asia/Istanbul": "TR",
  "Asia/Dubai": "AE",
  "Europe/London": "GB",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Detroit": "US",
  "America/Boise": "US",
  "America/Anchorage": "US",
  "America/Juneau": "US",
  "Pacific/Honolulu": "US",
};

/** Zone-family prefixes for countries with many named zones. */
const TZ_PREFIXES: [string, string][] = [
  ["America/Argentina/", "AR"],
  ["Australia/", "AU"],
  ["America/Indiana/", "US"],
  ["America/Kentucky/", "US"],
  ["America/North_Dakota/", "US"],
];

/**
 * Best-effort region from where the user actually is: device timezone
 * first, browser locale second, US when undetectable.
 */
export function detectRegion(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const region =
        TZ_REGION[tz] ??
        TZ_PREFIXES.find(([prefix]) => tz.startsWith(prefix))?.[1];
      if (region && KNOWN.has(region)) return region;
    }
  } catch {
    // Intl not fully supported — fall through
  }
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    if (region && KNOWN.has(region)) return region;
  } catch {
    // malformed locale — fall through
  }
  return "US";
}
