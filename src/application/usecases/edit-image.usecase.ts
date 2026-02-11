import type { EditParams } from "../../domain/entities/edit-params.js"
import { ApiKeyMissingError } from "../../domain/errors.js"
import type { FileStoragePort } from "../../domain/ports/file-storage.port.js"
import type { ImageGeneratorPort } from "../../domain/ports/image-generator.port.js"
import type { KeyStorePort } from "../../domain/ports/key-store.port.js"

export class EditImageUseCase {
  constructor(
    private readonly imageGenerator: ImageGeneratorPort,
    private readonly keyStore: KeyStorePort,
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(params: EditParams, outputDir: string): Promise<string> {
    const apiKey = await this.keyStore.get()
    if (!apiKey) throw new ApiKeyMissingError()

    let imageSource = params.imageSource
    if (typeof imageSource === "string" && !imageSource.startsWith("http")) {
      imageSource = await this.fileStorage.readImage(imageSource)
    }

    this.fileStorage.ensureDir(outputDir)

    const result = await this.imageGenerator.edit({ ...params, imageSource }, apiKey)

    const outputPath = this.fileStorage.generateOutputPath(outputDir, 0, result.mediaType)
    return this.fileStorage.saveImage(result.uint8Array, outputPath)
  }
}
