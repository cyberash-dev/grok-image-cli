import chalk from "chalk"
import { EditImageUseCase } from "./application/usecases/edit-image.usecase.js"
import { GenerateImageUseCase } from "./application/usecases/generate-image.usecase.js"
import { GetAuthStatusUseCase } from "./application/usecases/get-auth-status.usecase.js"
import { LoginUseCase } from "./application/usecases/login.usecase.js"
import { LogoutUseCase } from "./application/usecases/logout.usecase.js"
import type { KeyStorePort } from "./domain/ports/key-store.port.js"
import { FileStorageAdapter } from "./infrastructure/adapters/file-storage.adapter.js"
import { GrokApiAdapter } from "./infrastructure/adapters/grok-api.adapter.js"
import { KeychainAdapter } from "./infrastructure/adapters/keychain.adapter.js"
import { PassAdapter } from "./infrastructure/adapters/pass.adapter.js"
import { KeyStoreChain } from "./infrastructure/key-store-chain.js"
import { createCli } from "./presentation/cli.js"

const chain = new KeyStoreChain(
  [
    { store: new KeychainAdapter(), name: "Keychain" },
    { store: new PassAdapter(), name: "pass" },
  ],
  (name) => console.log(chalk.dim(`Key stored in: ${name}`)),
)

const keyStore: KeyStorePort = {
  save: (key) => chain.save(key),
  remove: () => chain.remove(),
  get: async () => (await chain.get()) ?? process.env.XAI_API_KEY ?? null,
}
const imageGenerator = new GrokApiAdapter()
const fileStorage = new FileStorageAdapter()

const generateImageUseCase = new GenerateImageUseCase(
  imageGenerator,
  keyStore,
  fileStorage,
)
const editImageUseCase = new EditImageUseCase(imageGenerator, keyStore, fileStorage)
const loginUseCase = new LoginUseCase(keyStore)
const logoutUseCase = new LogoutUseCase(keyStore)
const getAuthStatusUseCase = new GetAuthStatusUseCase(keyStore)

const program = createCli({
  generateImage: generateImageUseCase,
  editImage: editImageUseCase,
  login: loginUseCase,
  logout: logoutUseCase,
  getAuthStatus: getAuthStatusUseCase,
})

program.parse()
