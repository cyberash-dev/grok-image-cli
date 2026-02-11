import type { EditParams } from "../entities/edit-params.js"
import type { GenerateParams } from "../entities/generate-params.js"
import type { ImageResult } from "../entities/image-result.js"

export type ImageGeneratorPort = {
  generate(params: GenerateParams, apiKey: string): Promise<ImageResult[]>
  edit(params: EditParams, apiKey: string): Promise<ImageResult>
}
