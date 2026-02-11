export class ApiKeyMissingError extends Error {
  constructor() {
    super(
      "API key not found. Run `grok-img auth login` or set XAI_API_KEY environment variable.",
    )
    this.name = "ApiKeyMissingError"
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class ImageNotFoundError extends Error {
  constructor(path: string) {
    super(`Image not found: ${path}`)
    this.name = "ImageNotFoundError"
  }
}
