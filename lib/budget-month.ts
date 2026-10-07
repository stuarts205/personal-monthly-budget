// The month rolls over at midnight in this time zone, not the server's. Set
// BUDGET_TIME_ZONE (an IANA name, e.g. "America/New_York") to match yours.
const TIME_ZONE = process.env.BUDGET_TIME_ZONE || "UTC"

/** The current budget month as "YYYY-MM". */
export function getCurrentMonth(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now)

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value

  return `${year}-${month}`
}

/** "2026-10" -> "October 2026" */
export function formatMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number)

  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" }
  )
}
