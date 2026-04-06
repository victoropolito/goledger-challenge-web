type StatCardProps = {
  label: string;
  value: number | string;
  helperText?: string;
};

export default function StatCard({ label, value, helperText }: StatCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
      {helperText ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">{helperText}</p>
      ) : null}
    </section>
  );
}