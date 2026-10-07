// The month rolls over at midnight in this time zone, not the server's. Set
// BUDGET_TIME_ZONE (an IANA name, e.g. "America/New_York") to match yours.
const TIME_ZONE = process.env.BUDGET_TIME_ZONE || "UTC"

/** The budget-time-zone calendar date of `now` as "YYYY-MM-DD". */
export function getCurrentDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  return `${year}-${month}-${day}`
}

/** The current budget month as "YYYY-MM". */
export function getCurrentMonth(now: Date = new Date()): string {
  return getCurrentDate(now).slice(0, 7)
}

/** True for a real calendar date written as "YYYY-MM-DD". */
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** "2026-10-07" -> "Oct 7" */
export function formatEntryDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number)

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

/** "2026-10" -> "October 2026" */
export function formatMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number)

  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" }
  )
}
