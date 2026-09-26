const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getManilaDayStart(now = new Date()): Date {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);
    const part = (type: "year" | "month" | "day") =>
        Number(parts.find((value) => value.type === type)!.value);

    return new Date(Date.UTC(part("year"), part("month") - 1, part("day")) - MANILA_OFFSET_MS);
}

export function getNextManilaDayStart(dayStart: Date): Date {
    return new Date(dayStart.getTime() + DAY_MS);
}

/** Calendar date stored in the date-only order field, represented at UTC midnight. */
export function getManilaCalendarDate(now = new Date()): Date {
    return new Date(getManilaDayStart(now).getTime() + MANILA_OFFSET_MS);
}

export function isInManilaDay(date: Date, dayStart: Date): boolean {
    return date >= dayStart && date < getNextManilaDayStart(dayStart);
}
