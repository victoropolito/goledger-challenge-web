import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import WatchlistForm from "../components/watchlists/WatchlistForm";
import EmptyState from "../components/ui/EmptyState";
import FeedbackAlert from "../components/ui/FeedbackAlert";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Pagination from "../components/ui/Pagination";
import { createWatchlist, deleteWatchlist, getWatchlistsList, updateWatchlist } from "../api/watchlists";
import { getTvShowsList } from "../api/tvShows";
import type { CreateWatchlistInput, TvShow, Watchlist } from "../types/api";

function getAssetKey(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "@key" in value) return String((value as any)["@key"]);
  return "";
}

function getWatchlistShowTitles(watchlist: Watchlist, tvShows: TvShow[]): string[] {
  const refs = watchlist.tvShows ?? [];
  return refs.map((item) => {
    const key = getAssetKey(item);
    const matched = tvShows.find((show) => show["@key"] === key);
    if (matched) return matched.title;
    if (item && typeof item === "object" && "title" in item) return String((item as any).title);
    return key;
  }).filter(Boolean);
}

function getWatchlistShowKeys(watchlist: Watchlist): string[] {
  return (watchlist.tvShows ?? []).map(getAssetKey).filter(Boolean);
}

function WatchlistCard({ watchlist, tvShowTitles, onEdit, onDelete, isDeleting }: any) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{watchlist.title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{watchlist.description || "Sem descrição"}</p>
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Séries ({tvShowTitles.length})</p>
          {tvShowTitles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tvShowTitles.map((title: string) => (
                <span key={title} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {title}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Nenhuma série associada.</p>
          )}
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={() => onEdit(watchlist)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800">
          Editar
        </button>
        <button onClick={() => onDelete(watchlist)} disabled={isDeleting} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950">
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

const ITEMS_PER_PAGE = 5;

export default function WatchlistsPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("info");
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null);
  
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("title-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const watchlistsQuery = useQuery({ queryKey: ["watchlists"], queryFn: getWatchlistsList });
  const tvShowsQuery = useQuery({ queryKey: ["tv-shows"], queryFn: getTvShowsList });

  const createMutation = useMutation({
    mutationFn: (values: CreateWatchlistInput) => createWatchlist(values),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Watchlist criada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, values }: { key: string; values: CreateWatchlistInput }) => updateWatchlist(key, values),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Watchlist atualizada com sucesso.");
      setEditingWatchlist(null); await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteWatchlist(key),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Watchlist excluída.");
      setEditingWatchlist(null); await queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const watchlists = watchlistsQuery.data?.items ?? [];
  const tvShows = tvShowsQuery.data?.items ?? [];

  const processedItems = useMemo(() => {
    let result = [...watchlists];

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(watchlist => {
        const tvShowTitles = getWatchlistShowTitles(watchlist, tvShows).join(" ").toLowerCase();
        return (
          watchlist.title.toLowerCase().includes(term) ||
          (watchlist.description ?? "").toLowerCase().includes(term) ||
          tvShowTitles.includes(term)
        );
      });
    }

    result.sort((a, b) => {
      if (sortOrder === "title-asc") return a.title.localeCompare(b.title);
      if (sortOrder === "title-desc") return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [watchlists, tvShows, search, sortOrder]);

  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = processedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useMemo(() => setCurrentPage(1), [search, sortOrder]);

  if (watchlistsQuery.isLoading || tvShowsQuery.isLoading) return <div className="text-zinc-500">Carregando watchlists...</div>;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Watchlist"
        description="Gerencie listas personalizadas de séries para assistir."
      />

      {feedback && <FeedbackAlert message={feedback} variant={feedbackType} />}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total de Watchlists" value={watchlists.length} />
        
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-xs uppercase tracking-wide text-zinc-500">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Título ou descrição..."
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
            <option value="title-asc">Título (A-Z)</option>
            <option value="title-desc">Título (Z-A)</option>
          </select>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <section className="space-y-4">
          {paginatedItems.length > 0 ? (
            <>
              <div className="grid gap-4">
                {paginatedItems.map((watchlist) => (
                  <WatchlistCard
                    key={watchlist["@key"]!}
                    watchlist={watchlist}
                    tvShowTitles={getWatchlistShowTitles(watchlist, tvShows)}
                    onEdit={setEditingWatchlist}
                    onDelete={(w: Watchlist) => { if(window.confirm(`Excluir watchlist "${w.title}"?`)) deleteMutation.mutate(w["@key"]!) }}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          ) : (
            <EmptyState title="Nenhuma watchlist encontrada" description="Ajuste a busca ou crie uma nova." />
          )}
        </section>

        <section className="sticky top-[110px] space-y-6">
          {editingWatchlist ? (
            <WatchlistForm
              tvShows={tvShows}
              initialValues={{
                title: editingWatchlist.title,
                description: editingWatchlist.description ?? "",
                tvShowKeys: getWatchlistShowKeys(editingWatchlist),
              }}
              onSubmit={async (v) => { await updateMutation.mutateAsync({ key: editingWatchlist["@key"]!, values: v }) }}
              onCancel={() => setEditingWatchlist(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Salvar alterações"
              title={`Editar: ${editingWatchlist.title}`}
              disableTitle
            />
          ) : (
            <WatchlistForm
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