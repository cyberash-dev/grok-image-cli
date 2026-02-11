import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

export type AuthStatus = {
  authenticated: boolean
  maskedKey: string | null
  source: "keychain" | "env" | null
}

export class GetAuthStatusUseCase {
  constructor(private readonly keyStore: KeyStorePort) {}

  async execute(): Promise<AuthStatus> {
    const key = await this.keyStore.get()

    if (!key) {
      return { authenticated: false, maskedKey: null, source: null }
    }

    const masked =
      key.length > 8
        ? `${key.slice(0, 4)}${"*".repeat(key.length - 8)}${key.slice(-4)}`
        : "****"

    const source = process.env.XAI_API_KEY === key ? "env" : "keychain"

    return { authenticated: true, maskedKey: masked, source }
  }
}
