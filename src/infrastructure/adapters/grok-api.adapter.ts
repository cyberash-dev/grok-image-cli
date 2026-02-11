import { createXai } from "@ai-sdk/xai"
import { generateImage, NoImageGeneratedError } from "ai"
import type { EditParams } from "../../domain/entities/edit-params.js"
import type { GenerateParams } from "../../domain/entities/generate-params.js"
import type { ImageResult } from "../../domain/entities/image-result.js"
import { ApiError } from "../../domain/errors.js"
import type { ImageGeneratorPort } from "../../domain/ports/image-generator.port.js"

const MODEL = "grok-imagine-image"

export class GrokApiAdapter implements ImageGeneratorPort {
  async generate(params: GenerateParams, apiKey: string): Promise<ImageResult[]> {
    const xai = createXai({ apiKey })

    try {
      const { images } = await generateImage({
        model: xai.image(MODEL),
        prompt: params.prompt,
        aspectRatio: params.aspectRatio,
        n: params.count,
      })

      return images.map((img) => ({
        base64: img.base64,
        uint8Array: img.uint8Array,
        mediaType: img.mediaType,
      }))
    } catch (error) {
      if (NoImageGeneratedError.isInstance(error)) {
        throw new ApiError(
          "Image generation failed: the model could not produce an image.",
          error,
        )
      }
      if (error instanceof Error) {
        throw new ApiError(`API request failed: ${error.message}`, error)
      }
      throw new ApiError("An unexpected error occurred during image generation.", error)
    }
  }

  async edit(params: EditParams, apiKey: string): Promise<ImageResult> {
    const xai = createXai({ apiKey })

    try {
      const { image } = await generateImage({
        model: xai.image(MODEL),
        prompt: {
          text: params.prompt,
          images:
            typeof params.imageSource === "string"
              ? [new URL(params.imageSource)]
              : [params.imageSource],
        },
        aspectRatio: params.aspectRatio,
      })

      return {
        base64: image.base64,
        uint8Array: image.uint8Array,
        mediaType: image.mediaType,
      }
    } catch (error) {
      if (NoImageGeneratedError.isInstance(error)) {
        throw new ApiError(
          "Image editing failed: the model could not produce an image.",
          error,
        )
      }
      if (error instanceof Error) {
        throw new ApiError(`API request failed: ${error.message}`, error)
      }
      throw new ApiError("An unexpected error occurred during image editing.", error)
    }
  }
}
