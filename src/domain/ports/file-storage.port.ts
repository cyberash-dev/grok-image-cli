export type FileStoragePort = {
  saveImage(data: Uint8Array, outputPath: string): Promise<string>
  readImage(filePath: string): Promise<Uint8Array>
  ensureDir(dir: string): void
  generateOutputPath(dir: string, index: number, mediaType: string): string
}
