import { deletePassword, getPassword, setPassword } from "cross-keychain"
import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

const SERVICE = "grok-image-cli"
const ACCOUNT = "api-key"

export class KeychainAdapter implements KeyStorePort {
  async save(key: string): Promise<void> {
    await setPassword(SERVICE, ACCOUNT, key)
  }

  async get(): Promise<string | null> {
    const key = await getPassword(SERVICE, ACCOUNT)
    return key ?? null
  }

  async remove(): Promise<void> {
    await deletePassword(SERVICE, ACCOUNT)
  }
}
