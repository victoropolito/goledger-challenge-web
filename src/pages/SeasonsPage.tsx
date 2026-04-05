import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SeasonForm from "../components/seasons/SeasonForm";
import EmptyState from "../components/ui/EmptyState";
import FeedbackAlert from "../components/ui/FeedbackAlert";
import PageHeader from "../components/ui/PageHeader";
import SearchCard from "../components/ui/SearchCard";
import StatCard from "../components/ui/StatCard";
import { createSeason, deleteSeason, getSeasonsList, updateSeason } from "../api/seasons";
import { getTvShowsList } from "../api/tvShows";
import { formatDateTime } from "../lib/format";
import type { CreateSeasonInput, Season, TvShow } from "../types/api";

function getTvShowKey(value: Season["tvShow"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value["@key"]) {
    return String(value["@key"]);
  }
  return "";
}

function getTvShowLabel(value: Season["tvShow"], tvShows: TvShow[]): string {
  const key = getTvShowKey(value);
  const matched = tvShows.find((show) => show["@key"] === key);

  if (matched) return matched.title;

  if (value && typeof value === "object" && "title" in value) {
    return String(value.title);
  }

  return key || "TV Show não identificado";
}

function SeasonCard({
  season,
  tvShowLabel,
  onEdit,
  onDelete,
  isDeleting,
}: {
  season: Season;
  tvShowLabel: string;
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
  isDeleting: boolean;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-white">
          {tvShowLabel} — Season {season.number}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200">
            Ano {season.year}
          </span>
        </div>

        <div className="mt-4 space-y-1 text-xs text-zinc-500">
          <p>Key: {season["@key"] ?? "N/A"}</p>
          <p>Última atualização: {formatDateTime(season["@lastUpdated"])}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onEdit(season)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(season)}
          disabled={isDeleting}
          className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

export default function SeasonsPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("info");
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [search, setSearch] = useState("");

  const seasonsQuery = useQuery({
    queryKey: ["seasons"],
    queryFn: getSeasonsList,
  });

  const tvShowsQuery = useQuery({
    queryKey: ["tv-shows"],
    queryFn: getTvShowsList,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateSeasonInput) => createSeason(values),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Season criada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao criar season. Veja o console e a aba Network.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, values }: { key: string; values: CreateSeasonInput }) =>
      updateSeason(key, values),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Season atualizada com sucesso.");
      setEditingSeason(null);
      await queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao atualizar season. Veja o console e a aba Network.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteSeason(key),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Season excluída com sucesso.");
      setEditingSeason(null);
      await queryClient.invalidateQueries({ queryKey: ["seasons"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao excluir season. Veja o console e a aba Network.");
    },
  });

  async function handleCreate(values: CreateSeasonInput) {
    setFeedback("");
    await createMutation.mutateAsync(values);
  }

  async function handleUpdate(values: CreateSeasonInput) {
    if (!editingSeason?.["@key"]) {
      setFeedbackType("error");
      setFeedback("Não foi possível editar: @key ausente.");
      return;
    }

    setFeedback("");
    await updateMutation.mutateAsync({
      key: editingSeason["@key"],
      values,
    });
  }

  async function handleDelete(season: Season) {
    if (!season["@key"]) {
      setFeedbackType("error");
      setFeedback("Não foi possível excluir: @key ausente.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a season ${season.number}?`
    );

    if (!confirmed) return;

    setFeedback("");
    await deleteMutation.mutateAsync(season["@key"]);
  }

  const seasons = seasonsQuery.data?.items ?? [];
  const tvShows = tvShowsQuery.data?.items ?? [];

  const filteredSeasons = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...seasons]
      .sort((a, b) => {
        const aLabel = getTvShowLabel(a.tvShow, tvShows);
        const bLabel = getTvShowLabel(b.tvShow, tvShows);

        if (aLabel !== bLabel) return aLabel.localeCompare(bLabel);
        return a.number - b.number;
      })
      .filter((season) => {
        if (!term) return true;

        const tvShowLabel = getTvShowLabel(season.tvShow, tvShows).toLowerCase();

        return (
          tvShowLabel.includes(term) ||
          String(season.number).includes(term) ||
          String(season.year).includes(term)
        );
      });
  }, [seasons, tvShows, search]);

  if (seasonsQuery.isLoading || tvShowsQuery.isLoading) {
    return <div className="text-zinc-300">Carregando seasons...</div>;
  }

  if (seasonsQuery.isError || tvShowsQuery.isError) {
    return (
      <div className="text-red-400">
        Erro ao carregar seasons ou tv shows. Verifique console e network.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seasons"
        description="Gerencie temporadas vinculadas aos TV Shows já cadastrados."
        action={
          <button
            onClick={() => {
              seasonsQuery.refetch();
              tvShowsQuery.refetch();
            }}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Atualizar
          </button>
        }
      />

      {feedback ? <FeedbackAlert message={feedback} variant={feedbackType} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total de Seasons" value={seasons.length} helperText="Quantidade total cadastrada." />
        <StatCard label="Resultados filtrados" value={filteredSeasons.length} helperText="Itens visíveis com base na busca." />
        <SearchCard
          value={search}
          onChange={setSearch}
          placeholder="Buscar por série, número ou ano"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          {filteredSeasons.length > 0 ? (
            <section className="grid gap-4">
              {filteredSeasons.map((season) => (
                <SeasonCard
                  key={season["@key"] ?? `${getTvShowKey(season.tvShow)}-${season.number}`}
                  season={season}
                  tvShowLabel={getTvShowLabel(season.tvShow, tvShows)}
                  onEdit={setEditingSeason}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </section>
          ) : (
            <EmptyState
              title="Nenhuma season encontrada"
              description="Ajuste a busca ou crie uma nova season no formulário ao lado."
            />
          )}
        </section>

        <section className="space-y-6">
          {editingSeason ? (
            <SeasonForm
              tvShows={tvShows}
              initialValues={{
                number: editingSeason.number,
                tvShowKey: getTvShowKey(editingSeason.tvShow),
                year: editingSeason.year,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingSeason(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Salvar alterações"
              title={`Editar Season ${editingSeason.number}`}
              descriptionText="Como number e tvShow são chave, edite apenas o year."
              disableKeyFields
            />
          ) : (
            <SeasonForm
              tvShows={tvShows}
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
            />
          )}
        </section>
      </div>
    </div>
  );
}