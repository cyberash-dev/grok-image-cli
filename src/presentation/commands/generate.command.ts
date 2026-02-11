import { resolve } from "node:path"
import chalk from "chalk"
import { Command } from "commander"
import ora from "ora"
import type { GenerateImageUseCase } from "../../application/usecases/generate-image.usecase.js"
import { ApiError, ApiKeyMissingError } from "../../domain/errors.js"

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

export function createGenerateCommand(generateUseCase: GenerateImageUseCase): Command {
  return new Command("generate")
    .description("Generate images from a text prompt")
    .argument("<prompt>", "Text prompt describing the image to generate")
    .option("-a, --aspect-ratio <ratio>", "Aspect ratio", "auto")
    .option("-n, --count <number>", "Number of images (1-10)", "1")
    .option("-o, --output <dir>", "Output directory", "./grok-images")
    .action(async (prompt: string, options) => {
      const count = parseInt(options.count, 10)
      if (Number.isNaN(count) || count < 1 || count > 10) {
        console.error(chalk.red("Count must be a number between 1 and 10."))
        process.exit(1)
      }

      if (!VALID_RATIOS.includes(options.aspectRatio)) {
        console.error(
          chalk.red(`Invalid aspect ratio. Valid options: ${VALID_RATIOS.join(", ")}`),
        )
        process.exit(1)
      }

      const outputDir = resolve(options.output)
      const spinner = ora(`Generating ${count} image${count > 1 ? "s" : ""}...`).start()

      try {
        const paths = await generateUseCase.execute(
          { prompt, count, aspectRatio: options.aspectRatio },
          outputDir,
        )

        spinner.succeed(
          chalk.green(`Generated ${paths.length} image${paths.length > 1 ? "s" : ""}:`),
        )
        for (const p of paths) {
          console.log(chalk.dim(`  ${p}`))
        }
      } catch (error) {
        spinner.fail()
        if (error instanceof ApiKeyMissingError) {
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
