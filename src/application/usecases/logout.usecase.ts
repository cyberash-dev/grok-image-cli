import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

export class LogoutUseCase {
  constructor(private readonly keyStore: KeyStorePort) {}

  async execute(): Promise<void> {
    await this.keyStore.remove()
  }
}
