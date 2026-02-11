import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

const execFileAsync = promisify(execFile)

const SERVICE = "grok-image-cli"
const ACCOUNT = "api-key"

export class KeychainAdapter implements KeyStorePort {
  async save(key: string): Promise<void> {
    await execFileAsync("security", [
      "add-generic-password",
      "-U",
      "-s",
      SERVICE,
      "-a",
      ACCOUNT,
      "-w",
      key,
    ])
  }

  async get(): Promise<string | null> {
    try {
      const { stdout } = await execFileAsync("security", [
        "find-generic-password",
        "-s",
        SERVICE,
        "-a",
        ACCOUNT,
        "-w",
      ])
      const key = stdout.trim()
      if (key) return key
    } catch {
      // not found in keychain
    }

    return process.env.XAI_API_KEY ?? null
  }

  async remove(): Promise<void> {
    try {
      await execFileAsync("security", [
        "delete-generic-password",
        "-s",
        SERVICE,
        "-a",
        ACCOUNT,
      ])
    } catch {
      // already removed or never existed
    }
  }
}
