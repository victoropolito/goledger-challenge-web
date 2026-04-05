import { api } from "./client";

export async function getTx(txType?: string) {
  const payload = txType ? { txType } : {};
  const { data } = await api.post("/api/query/getTx", payload);
  return data;
}