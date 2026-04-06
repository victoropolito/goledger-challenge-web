import { FormEvent, useEffect, useState } from "react";
import type { CreateTvShowInput } from "../../types/api";

type TvShowFormProps = {
  initialValues?: CreateTvShowInput;
  onSubmit?: (values: CreateTvShowInput) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  title?: string;
  descriptionText?: string;
};

const initialState: CreateTvShowInput = {
  title: "",
  description: "",
  recommendedAge: 0,
};

export default function TvShowForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Salvar Série",
  title = "Criar Série",
  descriptionText = "Preencha os campos abaixo.",
}: TvShowFormProps) {
  const [form, setForm] = useState<CreateTvShowInput>(initialValues ?? initialState);

  useEffect(() => {
    setForm(initialValues ?? initialState);
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    await onSubmit?.({
      title: form.title.trim(),
      description: form.description.trim(),
      recommendedAge: Number(form.recommendedAge),
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
        <label className="block text-sm font-medium text-zinc-200">Título</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          placeholder="Título da série"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Descrição
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          className="min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          placeholder="Descrição da série"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-200">
          Idade recomendada
        </label>
        <input
          type="number"
          min={0}
          value={form.recommendedAge}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              recommendedAge: Number(e.target.value),
            }))
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