import { deletePassword, getPassword, setPassword } from "cross-keychain"
import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

const SERVICE = "grok-image-cli"
const ACCOUNT = "api-key"

export class CredentialStoreAdapter implements KeyStorePort {
  async save(key: string): Promise<void> {
    await setPassword(SERVICE, ACCOUNT, key)
  }

  async get(): Promise<string | null> {
    try {
      const key = await getPassword(SERVICE, ACCOUNT)
      if (key) return key
    } catch {}

    return process.env.XAI_API_KEY ?? null
  }

  async remove(): Promise<void> {
    try {
      await deletePassword(SERVICE, ACCOUNT)
    } catch {}
  }
}
