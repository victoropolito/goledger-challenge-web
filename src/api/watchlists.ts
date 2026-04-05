import { api } from "./client";
import { searchAssets } from "./schema";
import type { CreateWatchlistInput, Watchlist } from "../types/api";

function normalizeAssetArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const candidateKeys = ["results", "result", "data", "items", "assets"];

    for (const key of candidateKeys) {
      if (Array.isArray(obj[key])) {
        return obj[key] as T[];
      }
    }
  }

  return [];
}

function unwrapApiResult<T>(data: unknown): T {
  if (data && typeof data === "object" && "result" in (data as Record<string, unknown>)) {
    return (data as { result: T }).result;
  }

  return data as T;
}

function tvShowRef(tvShowKey: string) {
  return {
    "@assetType": "tvShows",
    "@key": tvShowKey,
  };
}

export async function getWatchlistsList() {
  const raw = await searchAssets("watchlist");

  return {
    raw,
    items: normalizeAssetArray<Watchlist>(raw),
  };
}

export async function createWatchlist(
  input: CreateWatchlistInput
): Promise<Watchlist> {
  const payload = {
    asset: [
      {
        "@assetType": "watchlist",
        title: input.title,
        ...(input.description ? { description: input.description } : {}),
        ...(input.tvShowKeys.length > 0
          ? { tvShows: input.tvShowKeys.map(tvShowRef) }
          : {}),
      },
    ],
  };

  const { data } = await api.post("/api/invoke/createAsset", payload);
  const result = unwrapApiResult<unknown>(data);

  if (Array.isArray(result) && result.length > 0) {
    return result[0] as Watchlist;
  }

  return result as Watchlist;
}

export async function updateWatchlist(
  key: string,
  input: CreateWatchlistInput
): Promise<Watchlist> {
  const payload = {
    update: {
      "@assetType": "watchlist",
      "@key": key,
      title: input.title,
      ...(input.description ? { description: input.description } : {}),
      tvShows: input.tvShowKeys.map(tvShowRef),
    },
  };

  const { data } = await api.put("/api/invoke/updateAsset", payload);
  const result = unwrapApiResult<unknown>(data);

  if (Array.isArray(result) && result.length > 0) {
    return result[0] as Watchlist;
  }

  return result as Watchlist;
}

export async function deleteWatchlist(key: string): Promise<void> {
  await api.delete("/api/invoke/deleteAsset", {
    data: {
      key: {
        "@assetType": "watchlist",
        "@key": key,
      },
    },
  });
}