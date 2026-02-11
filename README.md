# grok-img

CLI for generating and editing images with Grok API, powered by `@ai-sdk/xai`.

## Installation

```bash
npm install -g grok-image-cli
```

### From source

```bash
git clone https://github.com/cyberash/grok-image-cli.git
cd grok-image-cli
npm install
npm run build
npm link
```

## Authentication

The CLI stores your xAI API key securely in the macOS Keychain. Alternatively, set the `XAI_API_KEY` environment variable.

```bash
# Save API key to keychain
grok-img auth login

# Check authentication status
grok-img auth status

# Remove API key from keychain
grok-img auth logout
```

## Image Generation

```bash
# Generate a single image
grok-img generate "A futuristic city skyline at night"

# Generate multiple images with specific aspect ratio
grok-img generate "Mountain landscape at sunrise" -n 4 -a 16:9

# Specify output directory
grok-img generate "A serene Japanese garden" -o ./my-images
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-a, --aspect-ratio <ratio>` | Aspect ratio (`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `2:1`, `1:2`, `19.5:9`, `9:19.5`, `20:9`, `9:20`, `auto`) | `auto` |
| `-n, --count <number>` | Number of images (1-10) | `1` |
| `-o, --output <dir>` | Output directory | `./grok-images` |

## Image Editing

```bash
# Edit a local image
grok-img edit "Make it look like a watercolor painting" -i ./photo.jpg

# Edit using a URL
grok-img edit "Change the sky to sunset colors" -i https://example.com/photo.jpg

# Specify aspect ratio and output directory
grok-img edit "Add a vintage film grain effect" -i ./photo.jpg -a 3:2 -o ./edited
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --image <path>` | Source image (local path or URL) | **required** |
| `-a, --aspect-ratio <ratio>` | Aspect ratio | `auto` |
| `-o, --output <dir>` | Output directory | `./grok-images` |

## Development

```bash
npm install
npm run dev          # watch mode
npm run build        # production build
npm run lint         # check linting
npm run lint:fix     # auto-fix lint issues
npm run format       # format code
```

## Architecture

This project follows Clean Architecture principles:

```
src/
  main.ts                        # Composition root
  domain/                        # Entities & port interfaces (zero deps)
  application/                   # Use cases (depends on domain only)
  infrastructure/                # Adapters (@ai-sdk/xai, keychain, fs)
  presentation/                  # CLI commands (commander)
```

## Requirements

- Node.js >= 20.19.0
- macOS (for Keychain support) or `XAI_API_KEY` environment variable
- xAI API key from [console.x.ai](https://console.x.ai)

## License

MIT
