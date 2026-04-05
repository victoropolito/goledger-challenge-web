type StatCardProps = {
  label: string;
  value: number | string;
  helperText?: string;
};

export default function StatCard({
  label,
  value,
  helperText,
}: StatCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {helperText ? (
        <p className="mt-2 text-sm text-zinc-400">{helperText}</p>
      ) : null}
    </section>
  );
}