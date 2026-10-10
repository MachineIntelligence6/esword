"use client";

// Activity times are rendered in the viewer's own time zone, not the server's.
export function TimeRange({ first, last }: { first: string; last: string }) {
    const a = new Date(first);
    const b = new Date(last);
    const day = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const sameDay = a.toDateString() === b.toDateString();
    const isToday = b.toDateString() === new Date().toDateString();
    const dayLabel = isToday ? "Today" : day(b);
    let text: string;
    if (!sameDay) text = `${day(a)} – ${day(b)}`;
    else if (time(a) === time(b)) text = `${dayLabel}, ${time(b)}`;
    else text = `${dayLabel}, ${time(a)} – ${time(b)}`;
    return <span suppressHydrationWarning>{text}</span>;
}

export function ShortDate({ value }: { value: string }) {
    const d = new Date(value);
    const isToday = d.toDateString() === new Date().toDateString();
    return (
        <span suppressHydrationWarning>
            {isToday ? "today" : d.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
        </span>
    );
}
