import { createInterface } from "node:readline"
import chalk from "chalk"
import { Command } from "commander"
import type { GetAuthStatusUseCase } from "../../application/usecases/get-auth-status.usecase.js"
import type { LoginUseCase } from "../../application/usecases/login.usecase.js"
import type { LogoutUseCase } from "../../application/usecases/logout.usecase.js"

function readInput(prompt: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

export function createAuthCommand(useCases: {
  login: LoginUseCase
  logout: LogoutUseCase
  getStatus: GetAuthStatusUseCase
}): Command {
  const auth = new Command("auth").description("Manage API key authentication")

  auth
    .command("login")
    .description("Store your xAI API key in the system keychain")
    .action(async () => {
      try {
        const apiKey = await readInput(chalk.cyan("Enter your xAI API key: "))

        if (!apiKey) {
          console.log(chalk.red("No API key provided."))
          process.exit(1)
        }

        await useCases.login.execute(apiKey)
        console.log(chalk.green("API key saved to keychain successfully."))
      } catch (error) {
        console.error(
          chalk.red(
            `Failed to save API key: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        )
        process.exit(1)
      }
    })

  auth
    .command("logout")
    .description("Remove your xAI API key from the system keychain")
    .action(async () => {
      try {
        await useCases.logout.execute()
        console.log(chalk.green("API key removed from keychain."))
      } catch (error) {
        console.error(
          chalk.red(
            `Failed to remove API key: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        )
        process.exit(1)
      }
    })

  auth
    .command("status")
    .description("Check current authentication status")
    .action(async () => {
      try {
        const status = await useCases.getStatus.execute()

        if (status.authenticated) {
          console.log(chalk.green("Authenticated"))
          console.log(chalk.dim(`  Key: ${status.maskedKey}`))
          console.log(chalk.dim(`  Source: ${status.source}`))
        } else {
          console.log(chalk.yellow("Not authenticated"))
          console.log(
            chalk.dim(
              "  Run `grok-img auth login` or set XAI_API_KEY environment variable.",
            ),
          )
        }
      } catch (error) {
        console.error(
          chalk.red(
            `Failed to check status: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        )
        process.exit(1)
      }
    })

  return auth
}
