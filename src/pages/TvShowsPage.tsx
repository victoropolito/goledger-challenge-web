import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTvShow, deleteTvShow, getTvShowsList, updateTvShow } from "../api/tvShows";
import TvShowForm from "../components/tv-shows/TvShowForm";
import EmptyState from "../components/ui/EmptyState";
import FeedbackAlert from "../components/ui/FeedbackAlert";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Pagination from "../components/ui/Pagination";
import type { CreateTvShowInput, TvShow } from "../types/api";

function TvShowCard({ show, onEdit, onDelete, isDeleting }: any) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{show.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{show.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {show.recommendedAge}+ anos
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={() => onEdit(show)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800">
          Editar
        </button>
        <button onClick={() => onDelete(show)} disabled={isDeleting} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950">
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

const ITEMS_PER_PAGE = 5;

export default function TvShowsPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("info");
  const [editingShow, setEditingShow] = useState<TvShow | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("title-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const tvShowsQuery = useQuery({ queryKey: ["tv-shows"], queryFn: getTvShowsList });

  const createMutation = useMutation({
    mutationFn: (values: CreateTvShowInput) => createTvShow(values),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Série criada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, values }: { key: string; values: CreateTvShowInput }) => updateTvShow(key, values),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Série atualizada com sucesso.");
      setEditingShow(null); await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteTvShow(key),
    onSuccess: async () => {
      setFeedbackType("success"); setFeedback("Série excluída com sucesso.");
      setEditingShow(null); await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
  });

  const items = tvShowsQuery.data?.items ?? [];

  const processedItems = useMemo(() => {
    let result = [...items];

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(show => show.title.toLowerCase().includes(term));
    }

    result.sort((a, b) => {
      if (sortOrder === "title-asc") return a.title.localeCompare(b.title);
      if (sortOrder === "title-desc") return b.title.localeCompare(a.title);
      if (sortOrder === "age-asc") return a.recommendedAge - b.recommendedAge;
      if (sortOrder === "age-desc") return b.recommendedAge - a.recommendedAge;
      return 0;
    });

    return result;
  }, [items, search, sortOrder]);

  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = processedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useMemo(() => setCurrentPage(1), [search, sortOrder]);

  if (tvShowsQuery.isLoading) return <div className="text-zinc-500">Carregando Séries...</div>;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Séries"
        description="Gerencie o catálogo principal de séries."
      />

      {feedback && <FeedbackAlert message={feedback} variant={feedbackType} />}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total de Séries" value={items.length} />
        
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-xs uppercase tracking-wide text-zinc-500">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
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
            <option value="age-asc">Idade Recomendada (Crescente)</option>
            <option value="age-desc">Idade Recomendada (Decrescente)</option>
          </select>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <section className="space-y-4">
          {paginatedItems.length > 0 ? (
            <>
              <div className="grid gap-4">
                {paginatedItems.map((show) => (
                  <TvShowCard key={show["@key"] ?? show.title} show={show} onEdit={setEditingShow} onDelete={(s: TvShow) => { if(window.confirm(`Excluir "${s.title}"?`)) deleteMutation.mutate(s["@key"]!) }} isDeleting={deleteMutation.isPending} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          ) : (
            <EmptyState title="Nenhuma série encontrada" description="Ajuste a busca ou crie uma nova série no formulário." />
          )}
        </section>

        <section className="sticky top-[110px] space-y-6">
          {editingShow ? (
            <TvShowForm
              initialValues={{ title: editingShow.title, description: editingShow.description, recommendedAge: editingShow.recommendedAge }}
              onSubmit={async (v) => { await updateMutation.mutateAsync({ key: editingShow["@key"]!, values: v }) }}
              onCancel={() => setEditingShow(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Salvar alterações"
              title={`Editar: ${editingShow.title}`}
            />
          ) : (
            <TvShowForm onSubmit={async (v) => { await createMutation.mutateAsync(v) }} isSubmitting={createMutation.isPending} />
          )}
        </section>
      </div>
    </div>
  );
}