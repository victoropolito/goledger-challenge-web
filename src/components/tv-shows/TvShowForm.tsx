import { useEffect, useState, type FormEvent } from "react";
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

type FormState = { title: string; description: string; recommendedAge: number | string };
const initialState: FormState = { title: "", description: "", recommendedAge: "" };

export default function TvShowForm({ initialValues, onSubmit, onCancel, isSubmitting = false, submitLabel = "Salvar Série", title = "Criar Série", descriptionText = "Preencha os campos abaixo." }: TvShowFormProps) {
  const [form, setForm] = useState<FormState>(initialValues ?? initialState);

  useEffect(() => { setForm(initialValues ?? initialState); }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    await onSubmit?.({ title: form.title.trim(), description: form.description.trim(), recommendedAge: Number(form.recommendedAge) });
    if (!initialValues) setForm(initialState);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{descriptionText}</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Título</label>
        <input type="text" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" required />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Descrição</label>
        <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-[120px] w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" required />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Idade recomendada</label>
        <input type="number" min={0} max={18} value={form.recommendedAge} onChange={(e) => { const val = e.target.value; setForm((prev) => ({ ...prev, recommendedAge: val === "" ? "" : Number(val) })); }} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" required />
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