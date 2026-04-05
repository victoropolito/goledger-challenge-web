import { useQuery } from "@tanstack/react-query";
import { getAssetSchema, getAssetTypes } from "../api/schema";

const mainAssetTags = ["tvShows", "seasons", "episodes", "watchlist"] as const;

function JsonCard({
  title,
  data,
}: {
  title: string;
  data: unknown;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <pre className="overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-200">
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

export default function Dashboard() {
  const assetTypesQuery = useQuery({
    queryKey: ["asset-types"],
    queryFn: getAssetTypes,
  });

  const tvShowsSchemaQuery = useQuery({
    queryKey: ["asset-schema", "tvShows"],
    queryFn: () => getAssetSchema("tvShows"),
  });

  const seasonsSchemaQuery = useQuery({
    queryKey: ["asset-schema", "seasons"],
    queryFn: () => getAssetSchema("seasons"),
  });

  const episodesSchemaQuery = useQuery({
    queryKey: ["asset-schema", "episodes"],
    queryFn: () => getAssetSchema("episodes"),
  });

  const watchlistSchemaQuery = useQuery({
    queryKey: ["asset-schema", "watchlist"],
    queryFn: () => getAssetSchema("watchlist"),
  });

  const isLoading =
    assetTypesQuery.isLoading ||
    tvShowsSchemaQuery.isLoading ||
    seasonsSchemaQuery.isLoading ||
    episodesSchemaQuery.isLoading ||
    watchlistSchemaQuery.isLoading;

  const isError =
    assetTypesQuery.isError ||
    tvShowsSchemaQuery.isError ||
    seasonsSchemaQuery.isError ||
    episodesSchemaQuery.isError ||
    watchlistSchemaQuery.isError;

  if (isLoading) {
    return <div className="text-zinc-300">Carregando schemas...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-400">
        Erro ao carregar um ou mais schemas. Verifique o console/network.
      </div>
    );
  }

  const assetTypes = assetTypesQuery.data ?? [];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="mt-2 text-zinc-400">
          Exploração inicial da API e dos schemas principais.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold mb-4">Asset types disponíveis</h3>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assetTypes.map((asset) => (
            <div
              key={asset.tag}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold">{asset.label}</h4>
                <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                  {asset.tag}
                </span>
              </div>

              <p className="mt-3 text-sm text-zinc-400">{asset.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6">
        <JsonCard title="Schema: tvShows" data={tvShowsSchemaQuery.data} />
        <JsonCard title="Schema: seasons" data={seasonsSchemaQuery.data} />
        <JsonCard title="Schema: episodes" data={episodesSchemaQuery.data} />
        <JsonCard title="Schema: watchlist" data={watchlistSchemaQuery.data} />
      </div>
    </div>
  );
}