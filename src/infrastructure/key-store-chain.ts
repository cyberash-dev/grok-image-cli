import type { KeyStorePort } from "../domain/ports/key-store.port.js"

type NamedStore = { store: KeyStorePort; name: string }

export class KeyStoreChain implements KeyStorePort {
  constructor(
    private readonly stores: ReadonlyArray<NamedStore>,
    private readonly onSave?: (storeName: string) => void,
  ) {}

  async save(key: string): Promise<void> {
    let lastError: unknown
    for (const { store, name } of this.stores) {
      try {
        await store.save(key)
        this.onSave?.(name)
        return
      } catch (e) {
        lastError = e
      }
    }
    throw lastError
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
