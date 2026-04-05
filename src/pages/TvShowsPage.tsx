import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTvShowsList } from "../api/tvShows";
import { getTx } from "../api/tx";
import TvShowForm from "../components/tv-shows/TvShowForm";
import type { CreateTvShowInput } from "../types/api";

function TvShowCard({
  title,
  description,
  recommendedAge,
}: {
  title: string;
  description: string;
  recommendedAge: number;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-zinc-400">{description}</p>
        </div>

        <span className="shrink-0 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200">
          {recommendedAge}+ anos
        </span>
      </div>
    </article>
  );
}

export default function TvShowsPage() {
  const [draft, setDraft] = useState<CreateTvShowInput | null>(null);

  const tvShowsQuery = useQuery({
    queryKey: ["tv-shows"],
    queryFn: getTvShowsList,
  });

  const txListQuery = useQuery({
    queryKey: ["tx-list"],
    queryFn: () => getTx(),
  });

  async function handleDraftSubmit(values: CreateTvShowInput) {
    console.log("TV Show draft ready for create:", values);
    setDraft(values);
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
            Listagem e preparação do fluxo de criação.
          </p>
        </div>

        <button
          onClick={() => tvShowsQuery.refetch()}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Atualizar
        </button>
      </header>

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
                key={show.title}
                title={show.title}
                description={show.description}
                recommendedAge={show.recommendedAge}
              />
            ))}
          </section>
        </section>

        <section className="space-y-6">
          <TvShowForm onSubmit={handleDraftSubmit} />

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-xl font-semibold">Draft do payload</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Esse bloco mostra exatamente o que o formulário está produzindo.
            </p>

            <pre className="mt-4 overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-200">
              {JSON.stringify(draft, null, 2)}
            </pre>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-xl font-semibold">Transações disponíveis</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Vamos usar esse retorno para descobrir o contrato exato do create.
            </p>

            {txListQuery.isLoading ? (
              <p className="mt-4 text-zinc-300">Carregando transações...</p>
            ) : txListQuery.isError ? (
              <p className="mt-4 text-red-400">
                Erro ao carregar transações. Verifique a requisição getTx.
              </p>
            ) : (
              <pre className="mt-4 overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-200">
                {JSON.stringify(txListQuery.data, null, 2)}
              </pre>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}