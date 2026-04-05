import { api } from "./client";
import { searchAssets } from "./schema";
import type { CreateSeasonInput, Season } from "../types/api";

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

export async function getSeasonsList() {
  const raw = await searchAssets("seasons");

  return {
    raw,
    items: normalizeAssetArray<Season>(raw),
  };
}

export async function createSeason(input: CreateSeasonInput): Promise<Season> {
  const payload = {
    asset: [
      {
        "@assetType": "seasons",
        number: input.number,
        tvShow: tvShowRef(input.tvShowKey),
        year: input.year,
      },
    ],
  };

  const { data } = await api.post("/api/invoke/createAsset", payload);
  const result = unwrapApiResult<unknown>(data);

  if (Array.isArray(result) && result.length > 0) {
    return result[0] as Season;
  }

  return result as Season;
}

export async function updateSeason(
  key: string,
  input: CreateSeasonInput
): Promise<Season> {
  const payload = {
    update: {
      "@assetType": "seasons",
      "@key": key,
      number: input.number,
      tvShow: tvShowRef(input.tvShowKey),
      year: input.year,
    },
  };

  const { data } = await api.put("/api/invoke/updateAsset", payload);
  const result = unwrapApiResult<unknown>(data);

  if (Array.isArray(result) && result.length > 0) {
    return result[0] as Season;
  }

  return result as Season;
}

export async function deleteSeason(key: string): Promise<void> {
  await api.delete("/api/invoke/deleteAsset", {
    data: {
      key: {
        "@assetType": "seasons",
        "@key": key,
      },
    },
  });
}