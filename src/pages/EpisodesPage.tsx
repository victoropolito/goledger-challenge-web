import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EpisodeForm from "../components/episodes/EpisodeForm";
import EmptyState from "../components/ui/EmptyState";
import FeedbackAlert from "../components/ui/FeedbackAlert";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Pagination from "../components/ui/Pagination";
import { createEpisode, deleteEpisode, getEpisodesList, updateEpisode } from "../api/episodes";
import { getSeasonsList } from "../api/seasons";
import { getTvShowsList } from "../api/tvShows";
import type { CreateEpisodeInput, Episode, Season, TvShow } from "../types/api";

function getSeasonKey(value: Episode["season"] | Season["tvShow"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value["@key"]) return String(value["@key"]);
  return "";
}

function getTvShowKeyFromSeason(season: Season): string {
  return getSeasonKey(season.tvShow);
}

function getTvShowTitle(tvShowKey: string, tvShows: TvShow[]) {
  return tvShows.find((show) => show["@key"] === tvShowKey)?.title ?? tvShowKey;
}

function getSeasonLabel(season: Season, tvShows: TvShow[]) {
  const tvShowTitle = getTvShowTitle(getTvShowKeyFromSeason(season), tvShows);
  return `${tvShowTitle} — Temporada ${season.number}`;
}

function getEpisodeSeasonLabel(episode: Episode, seasons: Season[], tvShows: TvShow[]) {
  const seasonKey = getSeasonKey(episode.season);
  const season = seasons.find((item) => item["@key"] === seasonKey);
  if (!season) return seasonKey || "Temporada não identificada";
  return getSeasonLabel(season, tvShows);
}

function EpisodeCard({ episode, seasonLabel, onEdit, onDelete, isDeleting }: any) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Ep. {episode.episodeNumber} — {episode.title}
        </h3>
        <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">{seasonLabel}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{episode.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            Nota: {episode.rating ?? "N/A"}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            Lançamento: {new Date(episode.releaseDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
          </span>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={() => onEdit(episode)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800">
          Editar
        </button>
        <button onClick={() => onDelete(episode)} disabled={isDeleting} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950">
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

const ITEMS_PER_PAGE = 5;

export default function EpisodesPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("info");
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("season-ep-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const episodesQuery = useQuery({ queryKey: ["episodes"], queryFn: getEpisodesList });
  const seasonsQuery = useQuery({ queryKey: ["seasons"], queryFn: getSeasonsList });
  const tvShowsQuery = useQuery({ queryKey: ["tv-shows"], queryFn: getTvShowsList });

  const createMutation = useMutation({
    mutationFn: (values: CreateEpisodeInput) => createEpisode(values),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Episódio criado com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, values }: { key: string; values: CreateEpisodeInput }) => updateEpisode(key, values),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Episódio atualizado com sucesso.");
      setEditingEpisode(null); await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteEpisode(key),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Episódio excluído com sucesso.");
      setEditingEpisode(null); await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
  });

  const episodes = episodesQuery.data?.items ?? [];
  const seasons = seasonsQuery.data?.items ?? [];
  const tvShows = tvShowsQuery.data?.items ?? [];

  const processedItems = useMemo(() => {
    let result = [...episodes];

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(episode => {
        const seasonLabel = getEpisodeSeasonLabel(episode, seasons, tvShows).toLowerCase();
        return (
          episode.title.toLowerCase().includes(term) ||
          seasonLabel.includes(term) ||
          String(episode.episodeNumber).includes(term)
        );
      });
    }

    result.sort((a, b) => {
      if (sortOrder === "season-ep-asc" || sortOrder === "season-ep-desc") {
        const seasonALabel = getEpisodeSeasonLabel(a, seasons, tvShows);
        const seasonBLabel = getEpisodeSeasonLabel(b, seasons, tvShows);
        if (seasonALabel !== seasonBLabel) {
           return sortOrder === "season-ep-asc" ? seasonALabel.localeCompare(seasonBLabel) : seasonBLabel.localeCompare(seasonALabel);
        }
        return sortOrder === "season-ep-asc" ? a.episodeNumber - b.episodeNumber : b.episodeNumber - a.episodeNumber;
      }
      if (sortOrder === "rating-desc") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    return result;
  }, [episodes, seasons, tvShows, search, sortOrder]);

  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = processedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useMemo(() => setCurrentPage(1), [search, sortOrder]);

  if (episodesQuery.isLoading || seasonsQuery.isLoading || tvShowsQuery.isLoading) {
    return <div className="text-zinc-500">Carregando episódios...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Episódios"
        description="Gerencie episódios vinculados às temporadas."
      />

      {feedback && <FeedbackAlert message={feedback} variant={feedbackType} />}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total de Episódios" value={episodes.length} />
        
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-xs uppercase tracking-wide text-zinc-500">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Título, temporada ou número..."
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
            <option value="season-ep-asc">Temporada e Episódio (Cresc)</option>
            <option value="season-ep-desc">Temporada e Episódio (Decresc)</option>
            <option value="rating-desc">Melhor Nota</option>
          </select>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <section className="space-y-4">
          {paginatedItems.length > 0 ? (
            <>
              <div className="grid gap-4">
                {paginatedItems.map((episode) => (
                  <EpisodeCard
                    key={episode["@key"]!}
                    episode={episode}
                    seasonLabel={getEpisodeSeasonLabel(episode, seasons, tvShows)}
                    onEdit={setEditingEpisode}
                    onDelete={(e: Episode) => { if(window.confirm(`Excluir Episódio ${e.episodeNumber}?`)) deleteMutation.mutate(e["@key"]!) }}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          ) : (
            <EmptyState title="Nenhum episódio encontrado" description="Ajuste a busca ou crie um novo." />
          )}
        </section>

        <section className="sticky top-[110px] space-y-6">
          {editingEpisode ? (
            <EpisodeForm
              seasons={seasons}
              getSeasonLabel={(s) => getSeasonLabel(s, tvShows)}
              initialValues={{
                seasonKey: getSeasonKey(editingEpisode.season),
                episodeNumber: editingEpisode.episodeNumber,
                title: editingEpisode.title,
                releaseDate: editingEpisode.releaseDate,
                description: editingEpisode.description,
                rating: editingEpisode.rating,
              }}
              onSubmit={async (v) => { await updateMutation.mutateAsync({ key: editingEpisode["@key"]!, values: v }) }}
              onCancel={() => setEditingEpisode(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Salvar alterações"
              title={`Editar episódio ${editingEpisode.episodeNumber}`}
              disableKeyFields
            />
          ) : (
            <EpisodeForm
              seasons={seasons}
              getSeasonLabel={(s) => getSeasonLabel(s, tvShows)}
              onSubmit={async (v) => { await createMutation.mutateAsync(v) }}
              isSubmitting={createMutation.isPending}
            />
          )}
        </section>
      </div>
    </div>
  );
}