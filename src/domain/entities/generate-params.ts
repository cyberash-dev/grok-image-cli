export type Model = "grok-2-image-1212" | "grok-imagine-image-pro" | "grok-imagine-image"

export type GenerateParams = {
  prompt: string
  count: number
  aspectRatio: string
  model?: Model
}
