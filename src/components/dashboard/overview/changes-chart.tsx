import { fmt } from "./parts";

const W = 560, H = 190, L = 40, R = 8, T = 10, B = 24;

function niceMax(max: number) {
    if (max <= 4) return 4;
    const raw = max / 4;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
    return step * 4;
}

function shortNumber(n: number) {
    if (n >= 1000) return `${n / 1000}k`;
    return String(n);
}

function dayLabel(date: string) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function ChangesChart({ days }: { days: { date: string; count: number }[] }) {
    const max = niceMax(Math.max(...days.map((d) => d.count), 0));
    const plotW = W - L - R, plotH = H - T - B;
    const slot = plotW / days.length, barW = slot * 0.66;
    const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Changes per day for the last 30 days">
            {ticks.map((v) => {
                const y = T + plotH - (v / max) * plotH;
                return (
                    <g key={v}>
                        <line x1={L} x2={W - R} y1={y} y2={y} className="stroke-slate-200 dark:stroke-[#3d3d3a]" strokeWidth={1} />
                        <text x={L - 6} y={y + 3} textAnchor="end" fontSize={10} className="fill-current text-slate-500">{shortNumber(v)}</text>
                    </g>
                );
            })}
            {days.map((d, i) => {
                const h = d.count ? Math.max(2, (d.count / max) * plotH) : 0;
                const x = L + i * slot + (slot - barW) / 2;
                return (
                    <g key={d.date}>
                        {h > 0 && (
                            <rect x={x} y={T + plotH - h} width={barW} height={h} rx={2} className="fill-current text-primary">
                                <title>{`${dayLabel(d.date)}: ${fmt(d.count)} changes`}</title>
                            </rect>
                        )}
                        {(i % 5 === 0 || i === days.length - 1) && (
                            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize={10} className="fill-current text-slate-500">
                                {dayLabel(d.date)}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
