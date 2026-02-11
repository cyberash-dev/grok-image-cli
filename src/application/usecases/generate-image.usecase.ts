import type { GenerateParams } from "../../domain/entities/generate-params.js"
import { ApiKeyMissingError } from "../../domain/errors.js"
import type { FileStoragePort } from "../../domain/ports/file-storage.port.js"
import type { ImageGeneratorPort } from "../../domain/ports/image-generator.port.js"
import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

export class GenerateImageUseCase {
  constructor(
    private readonly imageGenerator: ImageGeneratorPort,
    private readonly keyStore: KeyStorePort,
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(params: GenerateParams, outputDir: string): Promise<string[]> {
    const apiKey = await this.keyStore.get()
    if (!apiKey) throw new ApiKeyMissingError()

    this.fileStorage.ensureDir(outputDir)

    const results = await this.imageGenerator.generate(params, apiKey)

    const savedPaths: string[] = []
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const outputPath = this.fileStorage.generateOutputPath(
        outputDir,
        i,
        result.mediaType,
      )
      const saved = await this.fileStorage.saveImage(result.uint8Array, outputPath)
      savedPaths.push(saved)
    }

    return savedPaths
  }
}
