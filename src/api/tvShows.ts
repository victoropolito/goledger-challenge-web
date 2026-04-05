import { api } from "./client";
import { searchAssets } from "./schema";
import type { CreateTvShowInput, TvShow } from "../types/api";

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

export async function getTvShowsList() {
  const raw = await searchAssets("tvShows");

  return {
    raw,
    items: normalizeAssetArray<TvShow>(raw),
  };
}

export async function createTvShow(input: CreateTvShowInput): Promise<TvShow> {
  const payload = {
    asset: [
      {
        "@assetType": "tvShows",
        ...input,
      },
    ],
  };

  const { data } = await api.post("/api/invoke/createAsset", payload);

  const result = unwrapApiResult<unknown>(data);

  if (Array.isArray(result) && result.length > 0) {
    return result[0] as TvShow;
  }

  return result as TvShow;
}

export async function updateTvShow(
  key: string,
  input: CreateTvShowInput
): Promise<TvShow> {
  const payload = {
    update: {
      "@assetType": "tvShows",
      "@key": key,
      ...input,
    },
  };

  const { data } = await api.put("/api/invoke/updateAsset", payload);

  const result = unwrapApiResult<unknown>(data);

  if (Array.isArray(result) && result.length > 0) {
    return result[0] as TvShow;
  }

  return result as TvShow;
}

export async function deleteTvShow(key: string): Promise<void> {
  await api.delete("/api/invoke/deleteAsset", {
    data: {
      key: {
        "@assetType": "tvShows",
        "@key": key,
      },
    },
  });
}