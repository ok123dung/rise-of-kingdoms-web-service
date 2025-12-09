import 'express'

declare module 'express' {
  interface Request {
    path?: string
    ip?: string
    connection?: {
      remoteAddress?: string
    }
    headers: Record<string, string | string[] | undefined>
  }

  interface Response {
    setHeader: (name: string, value: string) => void
    end: (chunk?: string | Buffer | Uint8Array, encoding?: string) => void
  }
}

export {}
