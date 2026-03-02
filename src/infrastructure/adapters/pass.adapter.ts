import { execFileSync } from "node:child_process"
import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

const SECRET_PATH = "grok-image-cli/api-key"

function detectTool(): string | null {
  for (const tool of ["gopass", "pass"]) {
    try {
      execFileSync("which", [tool], { stdio: "ignore" })
      return tool
    } catch {}
  }
  return null
}

const tool = detectTool()

export class PassAdapter implements KeyStorePort {
  async save(key: string): Promise<void> {
    if (!tool) throw new Error("Neither gopass nor pass is installed")

    const args =
      tool === "gopass"
        ? ["insert", "-f", SECRET_PATH]
        : ["insert", "-m", "--force", SECRET_PATH]

    execFileSync(tool, args, { input: `${key}\n`, stdio: ["pipe", "ignore", "ignore"] })
  }

  async get(): Promise<string | null> {
    if (!tool) throw new Error("Neither gopass nor pass is installed")

    try {
      const output = execFileSync(tool, ["show", SECRET_PATH], {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      })
      return output.trim().split("\n")[0] ?? null
    } catch {
      return null
    }
  }

  async remove(): Promise<void> {
    if (!tool) throw new Error("Neither gopass nor pass is installed")

    try {
      execFileSync(tool, ["rm", "--force", SECRET_PATH], { stdio: "ignore" })
    } catch {}
  }
}
