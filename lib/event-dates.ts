type EventStatus = { status?: "upcoming" | "live" | "past" | null };

export function isPastEvent(event: EventStatus) {
  return event.status === "past";
}

export function isUpcomingEvent(event: EventStatus) {
  return event.status === "upcoming";
}
