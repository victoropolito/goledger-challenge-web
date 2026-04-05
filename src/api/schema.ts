import { api } from "./client";
import type { AssetTypeSummary } from "../types/api";

export async function getSchema(assetType?: string) {
  const payload = assetType ? { assetType } : {};
  const { data } = await api.post("/api/query/getSchema", payload);
  return data;
}

export async function getAssetTypes(): Promise<AssetTypeSummary[]> {
  const data = await getSchema();
  return data;
}

export async function getAssetSchema(assetType: string) {
  const data = await getSchema(assetType);
  return data;
}

export async function searchAssets(assetType: string) {
  const { data } = await api.post("/api/query/search", {
    query: {
      selector: {
        "@assetType": assetType,
      },
    },
  });

  return data;
}