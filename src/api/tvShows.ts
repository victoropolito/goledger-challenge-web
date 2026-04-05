import { searchAssets } from "./schema";
import type { TvShow } from "../types/api";

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

export async function getTvShowsList() {
  const raw = await searchAssets("tvShows");

  return {
    raw,
    items: normalizeAssetArray<TvShow>(raw),
  };
}