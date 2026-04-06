import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SeasonForm from "../components/seasons/SeasonForm";
import EmptyState from "../components/ui/EmptyState";
import FeedbackAlert from "../components/ui/FeedbackAlert";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Pagination from "../components/ui/Pagination";
import { createSeason, deleteSeason, getSeasonsList, updateSeason } from "../api/seasons";
import { getTvShowsList } from "../api/tvShows";
import type { CreateSeasonInput, Season, TvShow } from "../types/api";

function getTvShowKey(value: Season["tvShow"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value["@key"]) return String(value["@key"]);
  return "";
}

function getTvShowLabel(value: Season["tvShow"], tvShows: TvShow[]): string {
  const key = getTvShowKey(value);
  const matched = tvShows.find((show) => show["@key"] === key);
  if (matched) return matched.title;
  if (value && typeof value === "object" && "title" in value) return String(value.title);
  return key || "Série não identificada";
}

function SeasonCard({ season, tvShowLabel, onEdit, onDelete, isDeleting }: any) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {tvShowLabel} — Temporada {season.number}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            Ano {season.year}
          </span>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={() => onEdit(season)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800">
          Editar
        </button>
        <button onClick={() => onDelete(season)} disabled={isDeleting} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950">
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

const ITEMS_PER_PAGE = 5;

export default function SeasonsPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("info");
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("show-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const seasonsQuery = useQuery({ queryKey: ["seasons"], queryFn: getSeasonsList });
  const tvShowsQuery = useQuery({ queryKey: ["tv-shows"], queryFn: getTvShowsList });

  const createMutation = useMutation({
    mutationFn: (values: CreateSeasonInput) => createSeason(values),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Temporada criada.");
      await queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, values }: { key: string; values: CreateSeasonInput }) => updateSeason(key, values),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Temporada atualizada.");
      setEditingSeason(null); await queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteSeason(key),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Temporada excluída.");
      setEditingSeason(null); await queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
  });

  const seasons = seasonsQuery.data?.items ?? [];
  const tvShows = tvShowsQuery.data?.items ?? [];

  const processedItems = useMemo(() => {
    let result = [...seasons];

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(season => {
        const tvShowLabel = getTvShowLabel(season.tvShow, tvShows).toLowerCase();
        return tvShowLabel.includes(term) || String(season.number).includes(term) || String(season.year).includes(term);
      });
    }

    result.sort((a, b) => {
      const aLabel = getTvShowLabel(a.tvShow, tvShows);
      const bLabel = getTvShowLabel(b.tvShow, tvShows);
      if (sortOrder === "show-asc") return aLabel.localeCompare(bLabel) || a.number - b.number;
      if (sortOrder === "show-desc") return bLabel.localeCompare(aLabel) || b.number - a.number;
      if (sortOrder === "year-asc") return a.year - b.year;
      if (sortOrder === "year-desc") return b.year - a.year;
      return 0;
    });

    return result;
  }, [seasons, tvShows, search, sortOrder]);

  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = processedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useMemo(() => setCurrentPage(1), [search, sortOrder]);

  if (seasonsQuery.isLoading || tvShowsQuery.isLoading) return <div className="text-zinc-500">Carregando temporadas...</div>;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Temporadas"
        description="Gerencie temporadas vinculadas às séries."
      />

      {feedback && <FeedbackAlert message={feedback} variant={feedbackType} />}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total de Temporadas" value={seasons.length} />
        
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-xs uppercase tracking-wide text-zinc-500">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Série, ano ou número..."
            className="mt-3 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-xs uppercase tracking-wide text-zinc-500">Ordenar por</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="mt-3 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          >
            <option value="show-asc">Série (A-Z)</option>
            <option value="show-desc">Série (Z-A)</option>
            <option value="year-desc">Ano mais recente</option>
            <option value="year-asc">Ano mais antigo</option>
          </select>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <section className="space-y-4">
          {paginatedItems.length > 0 ? (
            <>
              <div className="grid gap-4">
                {paginatedItems.map((season) => (
                  <SeasonCard
                    key={season["@key"]!}
                    season={season}
                    tvShowLabel={getTvShowLabel(season.tvShow, tvShows)}
                    onEdit={setEditingSeason}
                    onDelete={(s: Season) => { if(window.confirm(`Excluir Temporada ${s.number}?`)) deleteMutation.mutate(s["@key"]!) }}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          ) : (
            <EmptyState title="Nenhuma temporada encontrada" description="Ajuste a busca ou crie uma nova." />
          )}
        </section>

        <section className="sticky top-[110px] space-y-6">
          {editingSeason ? (
            <SeasonForm
              tvShows={tvShows}
              initialValues={{
                number: editingSeason.number,
                tvShowKey: getTvShowKey(editingSeason.tvShow),
                year: editingSeason.year,
              }}
              onSubmit={async (v) => { await updateMutation.mutateAsync({ key: editingSeason["@key"]!, values: v }) }}
              onCancel={() => setEditingSeason(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Salvar alterações"
              title={`Editar Temporada ${editingSeason.number}`}
              disableKeyFields
            />
          ) : (
            <SeasonForm
              tvShows={tvShows}
              onSubmit={async (v) => { await createMutation.mutateAsync(v) }}
              isSubmitting={createMutation.isPending}
            />
          )}
        </section>
      </div>
    </div>
  );
}