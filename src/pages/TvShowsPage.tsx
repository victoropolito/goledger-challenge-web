import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTvShow,
  deleteTvShow,
  getTvShowsList,
  updateTvShow,
} from "../api/tvShows";
import TvShowForm from "../components/tv-shows/TvShowForm";
import EmptyState from "../components/ui/EmptyState";
import FeedbackAlert from "../components/ui/FeedbackAlert";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { formatDateTime } from "../lib/format";
import type { CreateTvShowInput, TvShow } from "../types/api";

function TvShowCard({
  show,
  onEdit,
  onDelete,
  isDeleting,
}: {
  show: TvShow;
  onEdit: (show: TvShow) => void;
  onDelete: (show: TvShow) => void;
  isDeleting: boolean;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{show.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {show.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200">
              {show.recommendedAge}+ anos
            </span>
          </div>

          <div className="mt-4 space-y-1 text-xs text-zinc-500">
            <p>Key: {show["@key"] ?? "N/A"}</p>
            <p>Última atualização: {show["@lastUpdated"] ? new Date(show["@lastUpdated"]).toLocaleDateString('pt-BR') : "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onEdit(show)}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(show)}
          disabled={isDeleting}
          className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </article>
  );
}

export default function TvShowsPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("info");
  const [editingShow, setEditingShow] = useState<TvShow | null>(null);
  const [search, setSearch] = useState("");

  const tvShowsQuery = useQuery({
    queryKey: ["tv-shows"],
    queryFn: getTvShowsList,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateTvShowInput) => createTvShow(values),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Série criada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao criar série.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      key,
      values,
    }: {
      key: string;
      values: CreateTvShowInput;
    }) => updateTvShow(key, values),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Série atualizada com sucesso.");
      setEditingShow(null);
      await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao atualizar série.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteTvShow(key),
    onSuccess: async () => {
      setFeedbackType("success");
      setFeedback("Série excluída com sucesso.");
      if (editingShow) {
        setEditingShow(null);
      }
      await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedbackType("error");
      setFeedback("Erro ao excluir série.");
    },
  });

  async function handleCreate(values: CreateTvShowInput) {
    setFeedback("");
    await createMutation.mutateAsync(values);
  }

  async function handleUpdate(values: CreateTvShowInput) {
    if (!editingShow?.["@key"]) {
      setFeedbackType("error");
      setFeedback("Não foi possível editar: @key ausente.");
      return;
    }

    setFeedback("");
    await updateMutation.mutateAsync({
      key: editingShow["@key"],
      values,
    });
  }

  async function handleDelete(show: TvShow) {
    if (!show["@key"]) {
      setFeedbackType("error");
      setFeedback("Não foi possível excluir: @key ausente.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${show.title}"?`
    );

    if (!confirmed) return;

    setFeedback("");
    await deleteMutation.mutateAsync(show["@key"]);
  }

  if (tvShowsQuery.isLoading) {
    return <div className="text-zinc-300">Carregando Séries...</div>;
  }

  if (tvShowsQuery.isError) {
    return (
      <div className="text-red-400">
        Erro ao carregar Séries.
      </div>
    );
  }

  const items = tvShowsQuery.data?.items ?? [];

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return items;

    return items.filter((show) => {
      return (
        show.title.toLowerCase().includes(term)
      );
    });
  }, [items, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Séries"
        description="Gerencie o catálogo principal de séries."
        action={
          <button
            onClick={() => tvShowsQuery.refetch()}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Atualizar
          </button>
        }
      />

      {feedback ? (
        <FeedbackAlert message={feedback} variant={feedbackType} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total de Séries"
          value={items.length}
          helperText="Quantidade total cadastrada."
        />
        <StatCard
          label="Resultados filtrados"
          value={filteredItems.length}
          helperText="Quantidade visível com base na busca."
        />
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <label className="block text-xs uppercase tracking-wide text-zinc-500">
            Buscar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título"
            className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          {filteredItems.length > 0 ? (
            <section className="grid gap-4">
              {filteredItems.map((show) => (
                <TvShowCard
                  key={show["@key"] ?? show.title}
                  show={show}
                  onEdit={setEditingShow}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </section>
          ) : (
            <EmptyState
              title="Nenhuma série encontrada"
              description="Ajuste a busca ou crie uma nova série no formulário."
            />
          )}
        </section>

        <section className="space-y-6">
          {editingShow ? (
            <TvShowForm
              initialValues={{
                title: editingShow.title,
                description: editingShow.description,
                recommendedAge: editingShow.recommendedAge,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingShow(null)}
              isSubmitting={updateMutation.isPending}
              submitLabel="Salvar alterações"
              title={`Editar: ${editingShow.title}`}
              descriptionText="Atualize os dados da série selecionada."
            />
          ) : (
            <TvShowForm
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
            />
          )}
        </section>
      </div>
    </div>
  );
}