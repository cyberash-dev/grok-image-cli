import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

export class EnvKeyStoreAdapter implements KeyStorePort {
  async get(): Promise<string | null> {
    return process.env.XAI_API_KEY ?? null
  }

  async save(_key: string): Promise<void> {
    throw new Error("XAI_API_KEY is a read-only environment variable")
  }

  async remove(): Promise<void> {
    // no-op: environment variables cannot be deleted programmatically
  }
}
