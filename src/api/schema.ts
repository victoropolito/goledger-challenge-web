import { api } from "./client"

export async function getSchema(assetType?: string) {
  const payload = assetType ? { assetType } : {}
  const { data } = await api.post("/api/query/getSchema", payload)
  return data
}

export async function searchAssets(assetType: string) {
  const { data } = await api.post("/api/query/search", {
    query: {
      selector: {
        "@assetType": assetType,
      }
    }
  })

  return data
}