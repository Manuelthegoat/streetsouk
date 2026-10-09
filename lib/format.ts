export function formatNaira(amount: number) {
  return `₦ ${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// "14:00:00" -> "2:00 PM"
export function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(start: string, end?: string | null) {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}

export function timeAgo(iso: string) {
  const mins = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "JUST NOW";
  if (mins < 60) return `${mins} MIN${mins === 1 ? "" : "S"} AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} HOUR${hours === 1 ? "" : "S"} AGO`;
  const days = Math.floor(hours / 24);
  return `${days} DAY${days === 1 ? "" : "S"} AGO`;
}