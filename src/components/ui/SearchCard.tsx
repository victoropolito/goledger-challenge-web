type SearchCardProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function SearchCard({
  label = "Buscar",
  placeholder = "Digite para filtrar",
  value,
  onChange,
}: SearchCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <label className="block text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
      />
    </section>
  );
}