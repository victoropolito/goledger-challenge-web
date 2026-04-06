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
  const assetTypesQuery = useQuery({ queryKey: ["asset-types"], queryFn: getAssetTypes });
  const tvShowsQuery = useQuery({ queryKey: ["tv-shows"], queryFn: getTvShowsList });
  const seasonsQuery = useQuery({ queryKey: ["seasons"], queryFn: getSeasonsList });
  const episodesQuery = useQuery({ queryKey: ["episodes"], queryFn: getEpisodesList });
  const watchlistsQuery = useQuery({ queryKey: ["watchlists"], queryFn: getWatchlistsList });

  const isLoading = assetTypesQuery.isLoading || tvShowsQuery.isLoading || seasonsQuery.isLoading || episodesQuery.isLoading || watchlistsQuery.isLoading;
  const isError = assetTypesQuery.isError || tvShowsQuery.isError || seasonsQuery.isError || episodesQuery.isError || watchlistsQuery.isError;

  const tvShows = tvShowsQuery.data?.items ?? [];
  const seasons = seasonsQuery.data?.items ?? [];
  const episodes = episodesQuery.data?.items ?? [];
  const watchlists = watchlistsQuery.data?.items ?? [];

  if (isLoading) return <div className="text-zinc-500">Carregando dashboard...</div>;
  if (isError) return <div className="text-red-500">Erro ao carregar o dashboard.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do catálogo de séries, temporadas, episódios e watchlists."
        action={
          <button
            onClick={() => {
              tvShowsQuery.refetch();
              seasonsQuery.refetch();
              episodesQuery.refetch();
              watchlistsQuery.refetch();
            }}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          >
            Atualizar Tudo
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Séries" value={tvShows.length} helperText="Séries cadastradas no catálogo." />
        <StatCard label="Temporadas" value={seasons.length} helperText="Temporadas vinculadas as séries." />
        <StatCard label="Episódios" value={episodes.length} helperText="Episódios cadastrados." />
        <StatCard label="Watchlists" value={watchlists.length} helperText="Listas personalizadas criadas." />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickLinkCard to="/tv-shows" title="Gerenciar Séries" description="Criar, editar e excluir séries." />
        <QuickLinkCard to="/seasons" title="Gerenciar Temporadas" description="Criar e organizar temporadas por série." />
        <QuickLinkCard to="/episodes" title="Gerenciar Episódios" description="Cadastrar episódios por temporada." />
        <QuickLinkCard to="/watchlist" title="Gerenciar Watchlists" description="Montar listas de séries para assistir." />
      </section>
    </div>
  );
}