import { resolve } from "node:path"
import chalk from "chalk"
import { Command } from "commander"
import ora from "ora"
import type { EditImageUseCase } from "../../application/usecases/edit-image.usecase.js"
import { ApiError, ApiKeyMissingError, ImageNotFoundError } from "../../domain/errors.js"

const VALID_RATIOS = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "3:2",
  "2:3",
  "2:1",
  "1:2",
  "19.5:9",
  "9:19.5",
  "20:9",
  "9:20",
  "auto",
]

export function createEditCommand(editUseCase: EditImageUseCase): Command {
  return new Command("edit")
    .description("Edit an existing image with a text prompt")
    .argument("<prompt>", "Text prompt describing the edit to apply")
    .requiredOption("-i, --image <path>", "Source image (local file path or URL)")
    .option("-a, --aspect-ratio <ratio>", "Aspect ratio", "auto")
    .option("-o, --output <dir>", "Output directory", "./grok-images")
    .action(async (prompt: string, options) => {
      if (!VALID_RATIOS.includes(options.aspectRatio)) {
        console.error(
          chalk.red(`Invalid aspect ratio. Valid options: ${VALID_RATIOS.join(", ")}`),
        )
        process.exit(1)
      }

      const imageSource = options.image.startsWith("http")
        ? options.image
        : resolve(options.image)

      const outputDir = resolve(options.output)
      const spinner = ora("Editing image...").start()

      try {
        const savedPath = await editUseCase.execute(
          { prompt, imageSource, aspectRatio: options.aspectRatio },
          outputDir,
        )

        spinner.succeed(chalk.green("Image edited successfully:"))
        console.log(chalk.dim(`  ${savedPath}`))
      } catch (error) {
        spinner.fail()
        if (error instanceof ApiKeyMissingError) {
          console.error(chalk.red(error.message))
        } else if (error instanceof ImageNotFoundError) {
          console.error(chalk.red(error.message))
        } else if (error instanceof ApiError) {
          console.error(chalk.red(`API Error: ${error.message}`))
        } else {
          console.error(
            chalk.red(
              `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
            ),
          )
        }
        process.exit(1)
      }
    })
}
