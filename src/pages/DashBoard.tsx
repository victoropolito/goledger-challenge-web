import { useEffect, useState } from "react"
import { getSchema } from "../api/schema"

export default function Dashboard() {
  const [schema, setSchema] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getSchema()
      .then((data) => setSchema(data))
      .catch((err) => {
        console.error(err)
        setError(err?.message || "Erro ao carregar schema")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        Carregando...
      </div>
    )
  }

  if (error) {
    return (
      <div>
        Erro: {error}
      </div>
    )
  }

  return (
    <div>
      <p>
        Teste API
      </p>

      <pre>
        {JSON.stringify(schema, null, 2)}
      </pre>
    </div>
  )
}