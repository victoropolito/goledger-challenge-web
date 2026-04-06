import { useEffect, useState, type FormEvent } from "react";
import type { CreateWatchlistInput, TvShow } from "../../types/api";

type WatchlistFormProps = {
  tvShows: TvShow[]; initialValues?: CreateWatchlistInput; onSubmit?: (values: CreateWatchlistInput) => Promise<void> | void; onCancel?: () => void; isSubmitting?: boolean; submitLabel?: string; title?: string; descriptionText?: string; disableTitle?: boolean;
};

const initialState: CreateWatchlistInput = { title: "", description: "", tvShowKeys: [] };

export default function WatchlistForm({ tvShows, initialValues, onSubmit, onCancel, isSubmitting = false, submitLabel = "Salvar Watchlist", title = "Criar Watchlist", descriptionText = "Defina um nome e selecione as séries.", disableTitle = false }: WatchlistFormProps) {
  const [form, setForm] = useState<CreateWatchlistInput>(initialValues ?? initialState);
  const [searchShow, setSearchShow] = useState("");

  useEffect(() => { setForm(initialValues ?? initialState); }, [initialValues]);

  function toggleTvShow(tvShowKey: string) {
    setForm((prev) => {
      const exists = prev.tvShowKeys.includes(tvShowKey);
      return { ...prev, tvShowKeys: exists ? prev.tvShowKeys.filter((key) => key !== tvShowKey) : [...prev.tvShowKeys, tvShowKey] };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;
    await onSubmit?.({ title: form.title.trim(), description: form.description?.trim() ?? "", tvShowKeys: form.tvShowKeys });
    if (!initialValues) {
      setForm(initialState);
      setSearchShow("");
    }
  }

  const filteredTvShows = tvShows.filter((show) =>
    show.title.toLowerCase().includes(searchShow.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{descriptionText}</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Nome</label>
        <input type="text" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} disabled={disableTitle} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" required />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Descrição</label>
        <textarea value={form.description ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-[120px] w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" placeholder="Descrição opcional" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Séries</label>
          <input type="text" value={searchShow} onChange={(e) => setSearchShow(e.target.value)} placeholder="Buscar série..." className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
        </div>
        <div className="max-h-80 space-y-3 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {filteredTvShows.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhuma série disponível.</p>
          ) : (
            filteredTvShows.map((show) => {
              const key = show["@key"];
              if (!key) return null;
              return (
                <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900">
                  <input type="checkbox" checked={form.tvShowKeys.includes(key)} onChange={() => toggleTvShow(key)} className="mt-1" />
                  <div><p className="font-medium text-zinc-900 dark:text-white">{show.title}</p></div>
                </label>
              );
            })
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800">
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}