import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EpisodeForm from "../components/episodes/EpisodeForm";
import {
  createEpisode,
  deleteEpisode,
  getEpisodesList,
  updateEpisode,
} from "../api/episodes";
import { getSeasonsList } from "../api/seasons";
import { getTvShowsList } from "../api/tvShows";
import type {
  CreateEpisodeInput,
  Episode,
  Season,
  TvShow,
} from "../types/api";

function getSeasonKey(value: Episode["season"] | Season["tvShow"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value["@key"]) {
    return String(value["@key"]);
  }
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
  return `${tvShowTitle} — Season ${season.number}`;
}

function getEpisodeSeasonLabel(
  episode: Episode,
  seasons: Season[],
  tvShows: TvShow[]
) {
  const seasonKey = getSeasonKey(episode.season);
  const season = seasons.find((item) => item["@key"] === seasonKey);

  if (!season) return seasonKey || "Season não identificada";

  return getSeasonLabel(season, tvShows);
}

function formatDate(value: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function EpisodeCard({
  episode,
  seasonLabel,
  onEdit,
  onDelete,
  isDeleting,
}: {
  episode: Episode;
  seasonLabel: string;
  onEdit: (episode: Episode) => void;
  onDelete: (episode: Episode) => void;
  isDeleting: boolean;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            Ep. {episode.episodeNumber} — {episode.title}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">{seasonLabel}</p>
          <p className="mt-2 text-sm text-zinc-400">{episode.description}</p>

          <div className="mt-4 space-y-1 text-xs text-zinc-500">
            <p>Release: {formatDate(episode.releaseDate)}</p>
            <p>Rating: {episode.rating ?? "N/A"}</p>
            <p>Key: {episode["@key"] ?? "N/A"}</p>
            <p>Última atualização: {episode["@lastUpdated"] ?? "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onEdit(episode)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(episode)}
          disabled={isDeleting}
          className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

export default function EpisodesPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  const episodesQuery = useQuery({
    queryKey: ["episodes"],
    queryFn: getEpisodesList,
  });

  const seasonsQuery = useQuery({
    queryKey: ["seasons"],
    queryFn: getSeasonsList,
  });

  const tvShowsQuery = useQuery({
    queryKey: ["tv-shows"],
    queryFn: getTvShowsList,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateEpisodeInput) => createEpisode(values),
    onSuccess: async () => {
      setFeedback("Episode criado com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedback("Erro ao criar episode. Veja o console e a aba Network.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      key,
      values,
    }: {
      key: string;
      values: CreateEpisodeInput;
    }) => updateEpisode(key, values),
    onSuccess: async () => {
      setFeedback("Episode atualizado com sucesso.");
      setEditingEpisode(null);
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedback("Erro ao atualizar episode. Veja o console e a aba Network.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteEpisode(key),
    onSuccess: async () => {
      setFeedback("Episode excluído com sucesso.");
      setEditingEpisode(null);
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedback("Erro ao excluir episode. Veja o console e a aba Network.");
    },
  });

  async function handleCreate(values: CreateEpisodeInput) {
    setFeedback("");
    await createMutation.mutateAsync(values);
  }

  async function handleUpdate(values: CreateEpisodeInput) {
    if (!editingEpisode?.["@key"]) {
      setFeedback("Não foi possível editar: @key ausente.");
      return;
    }

    setFeedback("");
    await updateMutation.mutateAsync({
      key: editingEpisode["@key"],
      values,
    });
  }

  async function handleDelete(episode: Episode) {
    if (!episode["@key"]) {
      setFeedback("Não foi possível excluir: @key ausente.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o episódio ${episode.episodeNumber} - ${episode.title}?`
    );

    if (!confirmed) return;

    setFeedback("");
    await deleteMutation.mutateAsync(episode["@key"]);
  }

  const episodes = episodesQuery.data?.items ?? [];
  const seasons = seasonsQuery.data?.items ?? [];
  const tvShows = tvShowsQuery.data?.items ?? [];

  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => {
      const seasonALabel = getEpisodeSeasonLabel(a, seasons, tvShows);
      const seasonBLabel = getEpisodeSeasonLabel(b, seasons, tvShows);

      if (seasonALabel !== seasonBLabel) {
        return seasonALabel.localeCompare(seasonBLabel);
      }

      return a.episodeNumber - b.episodeNumber;
    });
  }, [episodes, seasons, tvShows]);

  if (
    episodesQuery.isLoading ||
    seasonsQuery.isLoading ||
    tvShowsQuery.isLoading
  ) {
    return <div className="text-zinc-300">Carregando episodes...</div>;
  }

  if (
    episodesQuery.isError ||
    seasonsQuery.isError ||
    tvShowsQuery.isError
  ) {
    return (
      <div className="text-red-400">
        Erro ao carregar episodes, seasons ou tv shows. Verifique console e network.
      </div>
    );
  }

  if (seasons.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Episodes</h2>
        <div className="rounded-2xl border border-amber-700/40 bg-amber-950/20 p-5">
          <p className="text-amber-200 font-semibold">
            Você precisa ter ao menos uma season cadastrada antes de criar episodes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Episodes</h2>
          <p className="mt-2 text-zinc-400">
            CRUD de episódios associado às seasons.
          </p>
        </div>

        <button
          onClick={() => {
            episodesQuery.refetch();
            seasonsQuery.refetch();
            tvShowsQuery.refetch();
          }}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Atualizar
        </button>
      </header>

      {feedback ? (
        <section className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-100">
          {feedback}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-300">
              Total encontrado:{" "}
              <span className="font-semibold">{sortedEpisodes.length}</span>
            </p>
          </div>

          <section className="grid gap-4">
            {sortedEpisodes.map((episode) => (
              <EpisodeCard
                key={episode["@key"] ?? `${getSeasonKey(episode.season)}-${episode.episodeNumber}`}
                episode={episode}
                seasonLabel={getEpisodeSeasonLabel(episode, seasons, tvShows)}
                onEdit={setEditingEpisode}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </section>
        </section>

        <section className="space-y-6">
          {editingEpisode ? (
            <EpisodeForm
              seasons={seasons}
              getSeasonLabel={(season) => getSeasonLabel(season, tvShows)}
              initialValues={{
                seasonKey: getSeasonKey(editingEpisode.season),
                episodeNumber: editingEpisode.episodeNumber,
                title: editingEpisode.title,
                releaseDate: editingEpisode.releaseDate,
                description: editingEpisode.description,
                rating: editingEpisode.rating,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingEpisode(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Salvar alterações"
              title={`Editar episódio ${editingEpisode.episodeNumber}`}
              descriptionText="Como season e episodeNumber são chave, edite os demais campos."
              disableKeyFields
            />
          ) : (
            <EpisodeForm
              seasons={seasons}
              getSeasonLabel={(season) => getSeasonLabel(season, tvShows)}
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
            />
          )}
        </section>
      </div>
    </div>
  );
}