import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import WatchlistForm from "../components/watchlists/WatchlistForm";
import EmptyState from "../components/ui/EmptyState";
import FeedbackAlert from "../components/ui/FeedbackAlert";
import PageHeader from "../components/ui/PageHeader";
import SearchCard from "../components/ui/SearchCard";
import StatCard from "../components/ui/StatCard";
import {
  createWatchlist,
  deleteWatchlist,
  getWatchlistsList,
  updateWatchlist,
} from "../api/watchlists";
import { getTvShowsList } from "../api/tvShows";
import { formatDateTime } from "../lib/format";
import type { CreateWatchlistInput, TvShow, Watchlist } from "../types/api";

function getAssetKey(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "@key" in value) {
    return String((value as { "@key": unknown })["@key"]);
  }
  return "";
}

function getWatchlistShowTitles(
  watchlist: Watchlist,
  tvShows: TvShow[]
): string[] {
  const refs = watchlist.tvShows ?? [];

  return refs
    .map((item) => {
      const key = getAssetKey(item);
      const matched = tvShows.find((show) => show["@key"] === key);

      if (matched) return matched.title;

      if (item && typeof item === "object" && "title" in item) {
        return String((item as { title: unknown }).title);
      }

      return key;
    })
    .filter(Boolean);
}

function getWatchlistShowKeys(watchlist: Watchlist): string[] {
  return (watchlist.tvShows ?? []).map(getAssetKey).filter(Boolean);
}

function WatchlistCard({
  watchlist,
  tvShowTitles,
  onEdit,
  onDelete,
  isDeleting,
}: {
  watchlist: Watchlist;
  tvShowTitles: string[];
  onEdit: (watchlist: Watchlist) => void;
  onDelete: (watchlist: Watchlist) => void;
  isDeleting: boolean;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-white">{watchlist.title}</h3>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {watchlist.description || "Sem descrição"}
        </p>

        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
            TV Shows ({tvShowTitles.length})
          </p>

          {tvShowTitles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tvShowTitles.map((title) => (
                <span
                  key={title}
                  className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200"
                >
                  {title}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Nenhum TV Show associado.</p>
          )}
        </div>

        <div className="mt-4 space-y-1 text-xs text-zinc-500">
          <p>Key: {watchlist["@key"] ?? "N/A"}</p>
          <p>Última atualização: {formatDateTime(watchlist["@lastUpdated"])}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onEdit(watchlist)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(watchlist)}
          disabled={isDeleting}
          className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

export default function WatchlistsPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("info");
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null);
  const [search, setSearch] = useState("");

  const watchlistsQuery = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlistsList,
  });

  const tvShowsQuery = useQuery({
    queryKey: ["tv-shows"],
    queryFn: getTvShowsList,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateWatchlistInput) => createWatchlist(values),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Watchlist criada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao criar watchlist. Veja o console e a aba Network.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, values }: { key: string; values: CreateWatchlistInput }) =>
      updateWatchlist(key, values),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Watchlist atualizada com sucesso.");
      setEditingWatchlist(null);
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao atualizar watchlist. Veja o console e a aba Network.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteWatchlist(key),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Watchlist excluída com sucesso.");
      setEditingWatchlist(null);
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao excluir watchlist. Veja o console e a aba Network.");
    },
  });

  async function handleCreate(values: CreateWatchlistInput) {
    setFeedback("");
    await createMutation.mutateAsync(values);
  }

  async function handleUpdate(values: CreateWatchlistInput) {
    if (!editingWatchlist?.["@key"]) {
      setFeedbackType("error");
      setFeedback("Não foi possível editar: @key ausente.");
      return;
    }

    setFeedback("");
    await updateMutation.mutateAsync({
      key: editingWatchlist["@key"],
      values,
    });
  }

  async function handleDelete(watchlist: Watchlist) {
    if (!watchlist["@key"]) {
      setFeedbackType("error");
      setFeedback("Não foi possível excluir: @key ausente.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a watchlist "${watchlist.title}"?`
    );

    if (!confirmed) return;

    setFeedback("");
    await deleteMutation.mutateAsync(watchlist["@key"]);
  }

  const watchlists = watchlistsQuery.data?.items ?? [];
  const tvShows = tvShowsQuery.data?.items ?? [];

  const filteredWatchlists = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...watchlists]
      .sort((a, b) => a.title.localeCompare(b.title))
      .filter((watchlist) => {
        if (!term) return true;

        const tvShowTitles = getWatchlistShowTitles(watchlist, tvShows).join(" ").toLowerCase();

        return (
          watchlist.title.toLowerCase().includes(term) ||
          (watchlist.description ?? "").toLowerCase().includes(term) ||
          tvShowTitles.includes(term)
        );
      });
  }, [watchlists, tvShows, search]);

  if (watchlistsQuery.isLoading || tvShowsQuery.isLoading) {
    return <div className="text-zinc-300">Carregando watchlists...</div>;
  }

  if (watchlistsQuery.isError || tvShowsQuery.isError) {
    return (
      <div className="text-red-400">
        Erro ao carregar watchlists ou tv shows. Verifique console e network.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Watchlist"
        description="Gerencie listas personalizadas de séries para assistir."
        action={
          <button
            onClick={() => {
              watchlistsQuery.refetch();
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
        <StatCard label="Total de Watchlists" value={watchlists.length} helperText="Quantidade total cadastrada." />
        <StatCard label="Resultados filtrados" value={filteredWatchlists.length} helperText="Itens visíveis com base na busca." />
        <SearchCard
          value={search}
          onChange={setSearch}
          placeholder="Buscar por título, descrição ou séries"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          {filteredWatchlists.length > 0 ? (
            <section className="grid gap-4">
              {filteredWatchlists.map((watchlist) => (
                <WatchlistCard
                  key={watchlist["@key"] ?? watchlist.title}
                  watchlist={watchlist}
                  tvShowTitles={getWatchlistShowTitles(watchlist, tvShows)}
                  onEdit={setEditingWatchlist}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </section>
          ) : (
            <EmptyState
              title="Nenhuma watchlist encontrada"
              description="Ajuste a busca ou crie uma nova watchlist no formulário ao lado."
            />
          )}
        </section>

        <section className="space-y-6">
          {editingWatchlist ? (
            <WatchlistForm
              tvShows={tvShows}
              initialValues={{
                title: editingWatchlist.title,
                description: editingWatchlist.description ?? "",
                tvShowKeys: getWatchlistShowKeys(editingWatchlist),
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingWatchlist(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Salvar alterações"
              title={`Editar: ${editingWatchlist.title}`}
              descriptionText="Como title é chave, ele fica bloqueado na edição."
              disableTitle
            />
          ) : (
            <WatchlistForm
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