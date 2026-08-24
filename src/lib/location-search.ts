export type LocationOption = {
  city: string;
  country: string;
  label: string;
  aliases: string[];
};

export const LOCATION_OPTIONS: LocationOption[] = [
  { city: "Hyderabad", country: "India", label: "Hyderabad, India", aliases: ["hyd", "hyderabad india", "hyderabad, india"] },
  { city: "Hyderabad", country: "Pakistan", label: "Hyderabad, Pakistan", aliases: ["hyderabad pakistan", "hyderabad, pakistan"] },
  { city: "Bengaluru", country: "India", label: "Bengaluru, India", aliases: ["blr", "bangalore", "bengaluru", "bengaluru india"] },
  { city: "Gurugram", country: "India", label: "Gurugram, India", aliases: ["gurgaon", "ggn", "gurugram", "gurugram india"] },
  { city: "Mumbai", country: "India", label: "Mumbai, India", aliases: ["bom", "bombay", "mumbai", "mumbai india"] },
  { city: "Pune", country: "India", label: "Pune, India", aliases: ["pnq", "pune", "pune india"] },
  { city: "Chennai", country: "India", label: "Chennai, India", aliases: ["maa", "madras", "chennai", "chennai india"] },
  { city: "Delhi", country: "India", label: "Delhi, India", aliases: ["del", "new delhi", "delhi", "delhi india"] },
  { city: "Remote", country: "", label: "Remote", aliases: ["remote", "wfh", "work from home", "anywhere"] },
];

function clean(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getLocationSuggestions(input: string, limit = 5) {
  const query = clean(input);
  if (!query) return [];
  return LOCATION_OPTIONS.filter((option) =>
    clean(option.label).startsWith(query) ||
    clean(option.city).startsWith(query) ||
    option.aliases.some((alias) => clean(alias).startsWith(query)),
  ).slice(0, limit);
}

export function normalizeLocation(input: string): string | null {
  const query = clean(input);
  if (!query) return null;

  // Product rule: the common student shorthand "Hyd" resolves to Hyderabad, India.
  if (query === "hyd") return "Hyderabad, India";

  const exact = LOCATION_OPTIONS.find((option) =>
    clean(option.label) === query || option.aliases.some((alias) => clean(alias) === query),
  );
  if (exact) return exact.label;

  const suggestions = getLocationSuggestions(input);
  return suggestions.length === 1 ? suggestions[0].label : null;
}

export function matchesStrictLocation(jobLocation: string, input: string) {
  if (!input.trim()) return true;
  const normalized = normalizeLocation(input);
  if (!normalized) return false;
  return clean(jobLocation) === clean(normalized);
}
