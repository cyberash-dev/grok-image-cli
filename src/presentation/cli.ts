import { Command } from "commander"
import type { EditImageUseCase } from "../application/usecases/edit-image.usecase.js"
import type { GenerateImageUseCase } from "../application/usecases/generate-image.usecase.js"
import type { GetAuthStatusUseCase } from "../application/usecases/get-auth-status.usecase.js"
import type { LoginUseCase } from "../application/usecases/login.usecase.js"
import type { LogoutUseCase } from "../application/usecases/logout.usecase.js"
import { createAuthCommand } from "./commands/auth.command.js"
import { createEditCommand } from "./commands/edit.command.js"
import { createGenerateCommand } from "./commands/generate.command.js"

export type UseCases = {
  generateImage: GenerateImageUseCase
  editImage: EditImageUseCase
  login: LoginUseCase
  logout: LogoutUseCase
  getAuthStatus: GetAuthStatusUseCase
}

export function createCli(useCases: UseCases): Command {
  const program = new Command()
    .name("grok-img")
    .description("CLI for generating and editing images with Grok API")
    .version("1.0.0")

  program.addCommand(
    createAuthCommand({
      login: useCases.login,
      logout: useCases.logout,
      getStatus: useCases.getAuthStatus,
    }),
  )

  program.addCommand(createGenerateCommand(useCases.generateImage))
  program.addCommand(createEditCommand(useCases.editImage))

  return program
}
