import type { Model } from "./generate-params.js"

export type EditParams = {
  prompt: string
  imageSource: string | Uint8Array
  aspectRatio: string
  model?: Model
}
