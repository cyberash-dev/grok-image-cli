---
name: grok-image-cli
description: Generate and edit images via Grok API from the command line. Secure macOS Keychain storage for xAI API key. Supports batch generation, aspect ratios, and style transfer.
metadata: {"clawdbot":{"emoji":"🎨","os":["macos"],"requires":{"bins":["grok-img","node"]},"install":[{"id":"npm","kind":"shell","command":"npm install -g grok-image-cli","bins":["grok-img"],"label":"Install grok-image-cli via npm"}],"source":"https://github.com/cyberash-dev/grok-image-cli"}}
---

# grok-image-cli

A CLI for generating and editing images using the xAI Grok API (`grok-imagine-image` model). Powered by the official `@ai-sdk/xai` SDK. Credentials are stored in macOS Keychain.

## Installation

Requires Node.js >= 20.19.0 and macOS. The package is fully open source under the MIT license: https://github.com/cyberash-dev/grok-image-cli

```bash
npm install -g grok-image-cli
```

Install from source (if you prefer to audit the code before running):
```bash
git clone https://github.com/cyberash-dev/grok-image-cli.git
cd grok-image-cli
npm install && npm run build && npm link
```

After installation the `grok-img` command is available globally.

## Quick Start

```bash
grok-img auth login                                          # Interactive prompt: enter xAI API key
grok-img generate "A futuristic city skyline at night"       # Generate an image
grok-img edit "Make it a watercolor painting" -i ./photo.jpg # Edit an existing image
```

## API Key Management

Store API key (interactive prompt):
```bash
grok-img auth login
```

Show stored key (masked) and source:
```bash
grok-img auth status
```

Remove key from Keychain:
```bash
grok-img auth logout
```

The CLI also supports the `XAI_API_KEY` environment variable as a fallback when no Keychain entry is found.

## Image Generation

```bash
grok-img generate "A collage of London landmarks in street-art style"
grok-img generate "Mountain landscape at sunrise" -n 4 -a 16:9
grok-img generate "A serene Japanese garden" -o ./my-images
```

## Image Editing

Edit a local file or a remote URL:
```bash
grok-img edit "Change the landmarks to New York City" -i ./landmarks.jpg
grok-img edit "Render as a pencil sketch" -i https://example.com/portrait.jpg
grok-img edit "Add a vintage film grain effect" -i ./photo.jpg -a 3:2 -o ./edited
```

## Flag Reference

### `generate`
| Flag | Description | Default |
|------|-------------|---------|
| `-a, --aspect-ratio <ratio>` | Aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 2:1, 1:2, 19.5:9, 9:19.5, 20:9, 9:20, auto) | auto |
| `-n, --count <number>` | Number of images to generate (1-10) | 1 |
| `-o, --output <dir>` | Output directory | ./grok-images |

### `edit`
| Flag | Description | Default |
|------|-------------|---------|
| `-i, --image <path>` | Source image (local file path or URL) | **required** |
| `-a, --aspect-ratio <ratio>` | Aspect ratio | auto |
| `-o, --output <dir>` | Output directory | ./grok-images |

## Security and Data Storage

The following properties are by design and can be verified in the source code:

- **xAI API key**: stored exclusively in macOS Keychain (service: `grok-image-cli`). By design, never written to disk in plaintext. See [`src/infrastructure/adapters/keychain.adapter.ts`](https://github.com/cyberash-dev/grok-image-cli/blob/main/src/infrastructure/adapters/keychain.adapter.ts) for the implementation.
- **No config files**: all settings are passed via CLI flags. Nothing is stored on disk besides the Keychain entry.
- **Network**: by design, the API key is only sent to `api.x.ai` over HTTPS via the official `@ai-sdk/xai` SDK. No other outbound connections are made. See [`src/infrastructure/adapters/grok-api.adapter.ts`](https://github.com/cyberash-dev/grok-image-cli/blob/main/src/infrastructure/adapters/grok-api.adapter.ts).
- **Generated images**: saved to the local output directory (default: `./grok-images`). No images are cached or uploaded elsewhere.

## API Reference

This CLI wraps the xAI Image Generation API via the Vercel AI SDK:
- Generation: `POST /v1/images/generations`
- Editing: `POST /v1/images/edits`

Documentation: https://docs.x.ai/docs/guides/image-generation
