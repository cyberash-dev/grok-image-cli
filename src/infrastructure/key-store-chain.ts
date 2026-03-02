import type { KeyStorePort } from "../domain/ports/key-store.port.js"

type NamedStore = { store: KeyStorePort; name: string }

export class KeyStoreChain implements KeyStorePort {
  constructor(
    private readonly stores: ReadonlyArray<NamedStore>,
    private readonly onSave?: (storeName: string) => void,
  ) {}

  async save(key: string): Promise<void> {
    for (const { store, name } of this.stores) {
      try {
        await store.save(key)
        this.onSave?.(name)
        return
      } catch {}
    }
    throw new Error(
      "Could not save the API key: system keychain is unavailable.\n" +
        "Set the environment variable instead:\n\n" +
        "  export XAI_API_KEY=<your-key>",
    )
  }

  async get(): Promise<string | null> {
    for (const { store } of this.stores) {
      try {
        const key = await store.get()
        if (key) return key
      } catch {}
    }
    return null
  }

  async remove(): Promise<void> {
    for (const { store } of this.stores) {
      try {
        await store.remove()
      } catch {}
    }
  }
}
