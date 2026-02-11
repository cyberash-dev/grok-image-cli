import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { ImageNotFoundError } from "../../domain/errors.js"
import type { FileStoragePort } from "../../domain/ports/file-storage.port.js"

const MEDIA_TYPE_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
}

export class FileStorageAdapter implements FileStoragePort {
  async saveImage(data: Uint8Array, outputPath: string): Promise<string> {
    writeFileSync(outputPath, data)
    return outputPath
  }

  async readImage(filePath: string): Promise<Uint8Array> {
    if (!existsSync(filePath)) {
      throw new ImageNotFoundError(filePath)
    }
    return new Uint8Array(readFileSync(filePath))
  }

  ensureDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  generateOutputPath(dir: string, index: number, mediaType: string): string {
    const ext = MEDIA_TYPE_EXT[mediaType] ?? "png"
    const timestamp = Date.now()
    return join(dir, `grok-img-${timestamp}-${index}.${ext}`)
  }
}
