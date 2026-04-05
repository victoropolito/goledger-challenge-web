import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTvShow,
  deleteTvShow,
  getTvShowsList,
  updateTvShow,
} from "../api/tvShows";
import TvShowForm from "../components/tv-shows/TvShowForm";
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
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{show.title}</h3>
          <p className="mt-2 text-sm text-zinc-400">{show.description}</p>

          <div className="mt-4 space-y-1 text-xs text-zinc-500">
            <p>Key: {show["@key"] ?? "N/A"}</p>
            <p>Última atualização: {show["@lastUpdated"] ?? "N/A"}</p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200">
          {show.recommendedAge}+ anos
        </span>
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
  const [feedback, setFeedback] = useState<string>("");
  const [editingShow, setEditingShow] = useState<TvShow | null>(null);

  const tvShowsQuery = useQuery({
    queryKey: ["tv-shows"],
    queryFn: getTvShowsList,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateTvShowInput) => createTvShow(values),
    onSuccess: async () => {
      setFeedback("TV Show criado com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedback("Erro ao criar TV Show. Veja o console e a aba Network.");
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
      setFeedback("TV Show atualizado com sucesso.");
      setEditingShow(null);
      await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedback("Erro ao atualizar TV Show. Veja o console e a aba Network.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteTvShow(key),
    onSuccess: async () => {
      setFeedback("TV Show excluído com sucesso.");
      if (editingShow) {
        setEditingShow(null);
      }
      await queryClient.invalidateQueries({ queryKey: ["tv-shows"] });
    },
    onError: (error) => {
      console.error(error);
      setFeedback("Erro ao excluir TV Show. Veja o console e a aba Network.");
    },
  });

  async function handleCreate(values: CreateTvShowInput) {
    setFeedback("");
    await createMutation.mutateAsync(values);
  }

  async function handleUpdate(values: CreateTvShowInput) {
    if (!editingShow?.["@key"]) {
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
    return <div className="text-zinc-300">Carregando TV Shows...</div>;
  }

  if (tvShowsQuery.isError) {
    return (
      <div className="text-red-400">
        Erro ao carregar TV Shows. Verifique o console e a aba Network.
      </div>
    );
  }

  const data = tvShowsQuery.data;
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">TV Shows</h2>
          <p className="mt-2 text-zinc-400">
            CRUD completo de TV Shows.
          </p>
        </div>

        <button
          onClick={() => tvShowsQuery.refetch()}
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
              <span className="font-semibold">{items.length}</span>
            </p>
          </div>

          <section className="grid gap-4">
            {items.map((show) => (
              <TvShowCard
                key={show["@key"] ?? show.title}
                show={show}
                onEdit={setEditingShow}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </section>
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
              descriptionText="Atualize os dados do TV Show selecionado."
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