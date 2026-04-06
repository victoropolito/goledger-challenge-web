import { FormEvent, useEffect, useState } from "react";
import type { CreateSeasonInput, TvShow } from "../../types/api";

type SeasonFormProps = {
  tvShows: TvShow[]; initialValues?: CreateSeasonInput; onSubmit?: (values: CreateSeasonInput) => Promise<void> | void; onCancel?: () => void; isSubmitting?: boolean; submitLabel?: string; title?: string; descriptionText?: string; disableKeyFields?: boolean;
};

type FormState = { number: number | string; tvShowKey: string; year: number | string };
const initialState: FormState = { number: "", tvShowKey: "", year: "" };

export default function SeasonForm({ tvShows, initialValues, onSubmit, onCancel, isSubmitting = false, submitLabel = "Salvar Temporada", title = "Criar Temporada", descriptionText = "Selecione a série, número da temporada e ano.", disableKeyFields = false }: SeasonFormProps) {
  const [form, setForm] = useState<FormState>(initialValues ?? initialState);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (initialValues) { 
      setForm(initialValues); 
      const show = tvShows.find(s => s["@key"] === initialValues.tvShowKey);
      if (show) setSearchTerm(show.title);
      return; 
    }
    
    // Resetando para o estado inicial vazio
    setForm(initialState);
    setSearchTerm("");
  }, [initialValues, tvShows]);

  const filteredShows = tvShows.filter(show => 
    show.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.tvShowKey) {
      alert("Por favor, selecione uma série válida na lista suspensa.");
      return;
    }
    await onSubmit?.({ number: Number(form.number), tvShowKey: form.tvShowKey, year: Number(form.year) });
    
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
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Série</label>
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            setForm((prev) => ({ ...prev, tvShowKey: "" })); 
          }} 
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)} 
          disabled={disableKeyFields} 
          placeholder="Buscar ou selecionar série..."
          className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" 
          required 
        />
        
        {showDropdown && !disableKeyFields && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {filteredShows.length > 0 ? (
              filteredShows.map(show => (
                <div 
                  key={show["@key"]} 
                  onClick={() => {
                    setForm((prev) => ({ ...prev, tvShowKey: show["@key"]! }));
                    setSearchTerm(show.title);
                    setShowDropdown(false);
                  }}
                  className="cursor-pointer px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {show.title}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-zinc-500">Nenhuma série encontrada</div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Temporada</label>
        <input type="number" min={1} max={30} value={form.number} onChange={(e) => { const val = e.target.value; setForm((prev) => ({ ...prev, number: val === "" ? "" : Number(val) })); }} disabled={disableKeyFields} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" required />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Ano</label>
        <input type="number" min={1900} max={2100} value={form.year} onChange={(e) => { const val = e.target.value; if (val.length > 4) return; setForm((prev) => ({ ...prev, year: val === "" ? "" : Number(val) })); }} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" required />
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