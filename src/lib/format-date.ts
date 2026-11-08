/**
 * I decided to build the date text by hand instead of using Intl.DateTimeFormat
 * because each date is rendered twice, on the server (SSR) and in the browser
 * (hydration), and both texts must match or React reports a hydration mismatch.
 * Intl's output depends on each engine's ICU data (Node, Chrome, Firefox,
 * Safari), so details such as the separator between date and time can differ.
 *
 * I picked a fixed Brasília offset (UTC-3) because the server and the
 * user's browser may be in different time zones. A fixed offset is safe since
 * Brazil has had no daylight saving time since 2019.
 * Tradeoff: users in other time zones also see Brasília time.
 */
const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

export function formatDate(timestamp: number) {
  // I shift the timestamp to Brasília time and read it with the UTC
  // getters because they ignore the machine's own time zone, so the server and
  // the browser compute the same "dd/mm/aaaa, hh:mm".
  const date = new Date(timestamp + BRASILIA_OFFSET_MS);
  const day = pad(date.getUTCDate());
  const month = pad(date.getUTCMonth() + 1);
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  return `${day}/${month}/${date.getUTCFullYear()}, ${hours}:${minutes}`;
}
