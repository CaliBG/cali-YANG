export default function WorkCaption({ name, year }: { name: string; year: string }) {
  return <div className="flex items-baseline justify-between gap-3 pt-3 text-xs uppercase lg:text-sm">
    <h2 className="min-w-0">{name}</h2>
    <time dateTime={year} className="shrink-0 font-mono-2 tabular-nums">{year}</time>
  </div>;
}
