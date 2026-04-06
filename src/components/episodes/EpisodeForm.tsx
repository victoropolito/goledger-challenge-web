import { FormEvent, useEffect, useState } from "react";
import type { CreateEpisodeInput, Season } from "../../types/api";

type EpisodeFormProps = {
  seasons: Season[]; getSeasonLabel: (season: Season) => string; initialValues?: CreateEpisodeInput; onSubmit?: (values: CreateEpisodeInput) => Promise<void> | void; onCancel?: () => void; isSubmitting?: boolean; submitLabel?: string; title?: string; descriptionText?: string; disableKeyFields?: boolean;
};

type EpisodeFormState = { seasonKey: string; episodeNumber: number | string; title: string; releaseDate: string; description: string; rating: string; };

function toDatetimeLocalValue(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoString(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

const initialState: EpisodeFormState = { seasonKey: "", episodeNumber: "", title: "", releaseDate: "", description: "", rating: "" };

export default function EpisodeForm({ seasons, getSeasonLabel, initialValues, onSubmit, onCancel, isSubmitting = false, submitLabel = "Salvar Episódio", title = "Criar Episódio", descriptionText = "Selecione a temporada e preencha os dados.", disableKeyFields = false }: EpisodeFormProps) {
  const [form, setForm] = useState<EpisodeFormState>(initialState);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setForm({ seasonKey: initialValues.seasonKey, episodeNumber: initialValues.episodeNumber, title: initialValues.title, releaseDate: toDatetimeLocalValue(initialValues.releaseDate), description: initialValues.description, rating: initialValues.rating !== undefined ? String(initialValues.rating) : "" });
      const season = seasons.find(s => s["@key"] === initialValues.seasonKey);
      if (season) setSearchTerm(getSeasonLabel(season));
      return;
    }
    
    // Resetando para o estado inicial vazio
    setForm(initialState);
    setSearchTerm("");
  }, [initialValues, seasons, getSeasonLabel]);

  const filteredSeasons = seasons.filter(s => 
    getSeasonLabel(s).toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.seasonKey || !form.title.trim() || !form.description.trim()) {
      if (!form.seasonKey) alert("Por favor, selecione uma temporada válida na lista.");
      return;
    }
    await onSubmit?.({ seasonKey: form.seasonKey, episodeNumber: Number(form.episodeNumber), title: form.title.trim(), releaseDate: toIsoString(form.releaseDate), description: form.description.trim(), rating: form.rating === "" ? undefined : Number(form.rating) });
    
    if (!initialValues) {
      setForm(initialState);
      setSearchTerm("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{descriptionText}</p>
      </div>

      <div className="space-y-2 relative">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Temporadas</label>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            setForm((prev) => ({ ...prev, seasonKey: "" }));
          }} 
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          disabled={disableKeyFields} 
          placeholder="Buscar ou selecionar temporada..."
          className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" 
          required 
        />
        
        {showDropdown && !disableKeyFields && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {filteredSeasons.length > 0 ? (
              filteredSeasons.map(season => (
                <div 
                  key={season["@key"]} 
                  onClick={() => {
                    setForm((prev) => ({ ...prev, seasonKey: season["@key"]! }));
                    setSearchTerm(getSeasonLabel(season));
                    setShowDropdown(false);
                  }}
                  className="cursor-pointer px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {getSeasonLabel(season)}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-zinc-500">Nenhuma temporada encontrada</div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Número do Episódio</label>
        <input type="number" min={1} value={form.episodeNumber} onChange={(e) => { const val = e.target.value; setForm((prev) => ({ ...prev, episodeNumber: val === "" ? "" : Number(val) }))}} disabled={disableKeyFields} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" required />
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
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Data de lançamento</label>
        <input type="datetime-local" value={form.releaseDate} onChange={(e) => setForm((prev) => ({ ...prev, releaseDate: e.target.value }))} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" required />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Nota</label>
        <input type="number" min={0} max={10} step="0.1" value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" placeholder="Opcional" />
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