import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

export class LoginUseCase {
  constructor(private readonly keyStore: KeyStorePort) {}

  async execute(apiKey: string): Promise<void> {
    await this.keyStore.save(apiKey)
  }
}
