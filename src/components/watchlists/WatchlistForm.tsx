import { FormEvent, useEffect, useState } from "react";
import type { CreateWatchlistInput, TvShow } from "../../types/api";

type WatchlistFormProps = {
  tvShows: TvShow[];
  initialValues?: CreateWatchlistInput;
  onSubmit?: (values: CreateWatchlistInput) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  title?: string;
  descriptionText?: string;
  disableTitle?: boolean;
};

const initialState: CreateWatchlistInput = {
  title: "",
  description: "",
  tvShowKeys: [],
};

export default function WatchlistForm({
  tvShows,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Salvar Watchlist",
  title = "Criar Watchlist",
  descriptionText = "Defina um nome e selecione as séries.",
  disableTitle = false,
}: WatchlistFormProps) {
  const [form, setForm] = useState<CreateWatchlistInput>(initialValues ?? initialState);

  useEffect(() => {
    setForm(initialValues ?? initialState);
  }, [initialValues]);

  function toggleTvShow(tvShowKey: string) {
    setForm((prev) => {
      const exists = prev.tvShowKeys.includes(tvShowKey);

      return {
        ...prev,
        tvShowKeys: exists
          ? prev.tvShowKeys.filter((key) => key !== tvShowKey)
          : [...prev.tvShowKeys, tvShowKey],
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) return;

    await onSubmit?.({
      title: form.title.trim(),
      description: form.description?.trim() ?? "",
      tvShowKeys: form.tvShowKeys,
    });

    if (!initialValues) {
      setForm(initialState);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5"
    >
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{descriptionText}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Nome
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          disabled={disableTitle}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 disabled:opacity-60"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Descrição
        </label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          className="min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          placeholder="Descrição opcional"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-200">
          Séries
        </label>

        <div className="max-h-80 space-y-3 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          {tvShows.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Nenhuma série disponível.
            </p>
          ) : (
            tvShows.map((show) => {
              const key = show["@key"];
              if (!key) return null;

              const checked = form.tvShowKeys.includes(key);

              return (
                <label
                  key={key}
                  className="flex items-start gap-3 rounded-lg border border-zinc-800 p-3 hover:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTvShow(key)}
                    className="mt-1"
                  />

                  <div>
                    <p className="font-medium text-white">{show.title}</p>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}