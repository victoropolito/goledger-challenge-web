import { api } from "./client";
import { searchAssets } from "./schema";
import type { CreateEpisodeInput, Episode } from "../types/api";

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

function seasonRef(seasonKey: string) {
  return {
    "@assetType": "seasons",
    "@key": seasonKey,
  };
}

export async function getEpisodesList() {
  const raw = await searchAssets("episodes");

  return {
    raw,
    items: normalizeAssetArray<Episode>(raw),
  };
}

export async function createEpisode(input: CreateEpisodeInput): Promise<Episode> {
  const payload = {
    asset: [
      {
        "@assetType": "episodes",
        season: seasonRef(input.seasonKey),
        episodeNumber: input.episodeNumber,
        title: input.title,
        releaseDate: input.releaseDate,
        description: input.description,
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
      },
    ],
  };

  const { data } = await api.post("/api/invoke/createAsset", payload);
  const result = unwrapApiResult<unknown>(data);

  if (Array.isArray(result) && result.length > 0) {
    return result[0] as Episode;
  }

  return result as Episode;
}

export async function updateEpisode(
  key: string,
  input: CreateEpisodeInput
): Promise<Episode> {
  const payload = {
    update: {
      "@assetType": "episodes",
      "@key": key,
      season: seasonRef(input.seasonKey),
      episodeNumber: input.episodeNumber,
      title: input.title,
      releaseDate: input.releaseDate,
      description: input.description,
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
    },
  };

  const { data } = await api.put("/api/invoke/updateAsset", payload);
  const result = unwrapApiResult<unknown>(data);

  if (Array.isArray(result) && result.length > 0) {
    return result[0] as Episode;
  }

  return result as Episode;
}

export async function deleteEpisode(key: string): Promise<void> {
  await api.delete("/api/invoke/deleteAsset", {
    data: {
      key: {
        "@assetType": "episodes",
        "@key": key,
      },
    },
  });
}