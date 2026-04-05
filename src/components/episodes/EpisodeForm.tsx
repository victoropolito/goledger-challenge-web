import { FormEvent, useEffect, useState } from "react";
import type { CreateEpisodeInput, Season } from "../../types/api";

type EpisodeFormProps = {
  seasons: Season[];
  getSeasonLabel: (season: Season) => string;
  initialValues?: CreateEpisodeInput;
  onSubmit?: (values: CreateEpisodeInput) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  title?: string;
  descriptionText?: string;
  disableKeyFields?: boolean;
};

type EpisodeFormState = {
  seasonKey: string;
  episodeNumber: number;
  title: string;
  releaseDate: string;
  description: string;
  rating: string;
};

function toDatetimeLocalValue(value: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (num: number) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoString(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

const initialState: EpisodeFormState = {
  seasonKey: "",
  episodeNumber: 1,
  title: "",
  releaseDate: "",
  description: "",
  rating: "",
};

export default function EpisodeForm({
  seasons,
  getSeasonLabel,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Salvar Episode",
  title = "Criar Episode",
  descriptionText = "Selecione a season e preencha os dados do episódio.",
  disableKeyFields = false,
}: EpisodeFormProps) {
  const [form, setForm] = useState<EpisodeFormState>(initialState);

  useEffect(() => {
    if (initialValues) {
      setForm({
        seasonKey: initialValues.seasonKey,
        episodeNumber: initialValues.episodeNumber,
        title: initialValues.title,
        releaseDate: toDatetimeLocalValue(initialValues.releaseDate),
        description: initialValues.description,
        rating:
          initialValues.rating !== undefined ? String(initialValues.rating) : "",
      });
      return;
    }

    setForm({
      ...initialState,
      seasonKey: seasons[0]?.["@key"] ?? "",
    });
  }, [initialValues, seasons]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.seasonKey || !form.title.trim() || !form.description.trim()) {
      return;
    }

    await onSubmit?.({
      seasonKey: form.seasonKey,
      episodeNumber: Number(form.episodeNumber),
      title: form.title.trim(),
      releaseDate: toIsoString(form.releaseDate),
      description: form.description.trim(),
      rating: form.rating === "" ? undefined : Number(form.rating),
    });

    if (!initialValues) {
      setForm({
        ...initialState,
        seasonKey: seasons[0]?.["@key"] ?? "",
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
          Season
        </label>
        <select
          value={form.seasonKey}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, seasonKey: e.target.value }))
          }
          disabled={disableKeyFields}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 disabled:opacity-60"
          required
        >
          <option value="">Selecione uma season</option>
          {seasons.map((season) => (
            <option key={season["@key"]} value={season["@key"]}>
              {getSeasonLabel(season)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Episode Number
        </label>
        <input
          type="number"
          min={1}
          value={form.episodeNumber}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              episodeNumber: Number(e.target.value),
            }))
          }
          disabled={disableKeyFields}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 disabled:opacity-60"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Release Date
        </label>
        <input
          type="datetime-local"
          value={form.releaseDate}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, releaseDate: e.target.value }))
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          className="min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Rating
        </label>
        <input
          type="number"
          min={0}
          step="0.1"
          value={form.rating}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, rating: e.target.value }))
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          placeholder="Opcional"
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