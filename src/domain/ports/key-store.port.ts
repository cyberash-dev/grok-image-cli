export type KeyStorePort = {
  save(key: string): Promise<void>
  get(): Promise<string | null>
  remove(): Promise<void>
}
