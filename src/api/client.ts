import axios from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL
const user = import.meta.env.VITE_API_BASIC_USER
const pass = import.meta.env.VITE_API_BASIC_PASS

const basicToken = btoa(`${user}:${pass}`)

export const api = axios.create({
  baseURL,
  headers: {
    Authorization: `Basic ${basicToken}`,
    "Content-Type": "application/json",
    Accept: "*/*"
  }
})