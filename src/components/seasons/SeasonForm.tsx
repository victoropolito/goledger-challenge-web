import { FormEvent, useEffect, useState } from "react";
import type { CreateSeasonInput, TvShow } from "../../types/api";

type SeasonFormProps = {
  tvShows: TvShow[];
  initialValues?: CreateSeasonInput;
  onSubmit?: (values: CreateSeasonInput) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  title?: string;
  descriptionText?: string;
  disableKeyFields?: boolean;
};

const initialState: CreateSeasonInput = {
  number: 1,
  tvShowKey: "",
  year: new Date().getFullYear(),
};

export default function SeasonForm({
  tvShows,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Salvar Temporada",
  title = "Criar Temporada",
  descriptionText = "Selecione a série, número da temporada e ano.",
  disableKeyFields = false,
}: SeasonFormProps) {
  const [form, setForm] = useState<CreateSeasonInput>(initialValues ?? initialState);

  useEffect(() => {
    if (initialValues) {
      setForm(initialValues);
      return;
    }

    setForm({
      ...initialState,
      tvShowKey: tvShows[0]?.["@key"] ?? "",
    });
  }, [initialValues, tvShows]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.tvShowKey) return;

    await onSubmit?.({
      number: Number(form.number),
      tvShowKey: form.tvShowKey,
      year: Number(form.year),
    });

    if (!initialValues) {
      setForm({
        number: 1,
        tvShowKey: tvShows[0]?.["@key"] ?? "",
        year: new Date().getFullYear(),
      });
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
          Série
        </label>
        <select
          value={form.tvShowKey}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, tvShowKey: e.target.value }))
          }
          disabled={disableKeyFields}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 disabled:opacity-60"
          required
        >
          <option value="">Selecione uma série</option>
          {tvShows.map((show) => (
            <option key={show["@key"] ?? show.title} value={show["@key"]}>
              {show.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Temporada
        </label>
        <input
          type="number"
          min={1}
          value={form.number}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, number: Number(e.target.value) }))
          }
          disabled={disableKeyFields}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 disabled:opacity-60"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Ano
        </label>
        <input
          type="number"
          min={1900}
          max={2100}
          value={form.year}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, year: Number(e.target.value) }))
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          required
        />
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