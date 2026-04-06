import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAssetTypes } from "../api/schema";
import { getEpisodesList } from "../api/episodes";
import { getSeasonsList } from "../api/seasons";
import { getTvShowsList } from "../api/tvShows";
import { getWatchlistsList } from "../api/watchlists";
import PageHeader from "../components/ui/PageHeader";
import QuickLinkCard from "../components/ui/QuickLinkCard";
import StatCard from "../components/ui/StatCard";

export default function Dashboard() {
  const assetTypesQuery = useQuery({
    queryKey: ["asset-types"],
    queryFn: getAssetTypes,
  });

  const tvShowsQuery = useQuery({
    queryKey: ["tv-shows"],
    queryFn: getTvShowsList,
  });

  const seasonsQuery = useQuery({
    queryKey: ["seasons"],
    queryFn: getSeasonsList,
  });

  const episodesQuery = useQuery({
    queryKey: ["episodes"],
    queryFn: getEpisodesList,
  });

  const watchlistsQuery = useQuery({
    queryKey: ["watchlists"],
    queryFn: getWatchlistsList,
  });

  const isLoading =
    assetTypesQuery.isLoading ||
    tvShowsQuery.isLoading ||
    seasonsQuery.isLoading ||
    episodesQuery.isLoading ||
    watchlistsQuery.isLoading;

  const isError =
    assetTypesQuery.isError ||
    tvShowsQuery.isError ||
    seasonsQuery.isError ||
    episodesQuery.isError ||
    watchlistsQuery.isError;

  const assetTypes = assetTypesQuery.data ?? [];
  const tvShows = tvShowsQuery.data?.items ?? [];
  const seasons = seasonsQuery.data?.items ?? [];
  const episodes = episodesQuery.data?.items ?? [];
  const watchlists = watchlistsQuery.data?.items ?? [];

  const visibleAssetTypes = useMemo(() => {
    return assetTypes.filter((item) =>
      ["tvShows", "seasons", "episodes", "watchlist"].includes(item.tag)
    );
  }, [assetTypes]);

  if (isLoading) {
    return <div className="text-zinc-300">Carregando dashboard...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-400">
        Erro ao carregar o dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do catálogo de séries, temporadas, episódios e watchlists."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Séries"
          value={tvShows.length}
          helperText="Séries cadastradas no catálogo."
        />
        <StatCard
          label="Temporadas"
          value={seasons.length}
          helperText="Temporadas vinculadas as séries."
        />
        <StatCard
          label="Episódios"
          value={episodes.length}
          helperText="Episódios cadastrados."
        />
        <StatCard
          label="Watchlists"
          value={watchlists.length}
          helperText="Listas personalizadas criadas."
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickLinkCard
          to="/tv-shows"
          title="Gerenciar Séries"
          description="Criar, editar e excluir séries."
        />
        <QuickLinkCard
          to="/seasons"
          title="Gerenciar Temporadas"
          description="Criar e organizar temporadas por série."
        />
        <QuickLinkCard
          to="/episodes"
          title="Gerenciar Episódios"
          description="Cadastrar episódios por temporada."
        />
        <QuickLinkCard
          to="/watchlist"
          title="Gerenciar Watchlists"
          description="Montar listas de séries para assistir."
        />
      </section>

      {/* <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-xl font-semibold text-white">Asset Types</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Estruturas principais identificadas pela API.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleAssetTypes.map((asset) => (
            <article
              key={asset.tag}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-white">{asset.label}</h4>
                <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                  {asset.tag}
                </span>
              </div>

              <p className="mt-3 text-sm text-zinc-400">
                {asset.description}
              </p>
            </article>
          ))}
        </div>
      </section> */}
    </div>
  );
}