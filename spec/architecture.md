# Архитектура grok-image-cli

## Обзор

`grok-image-cli` — CLI-утилита для генерации и редактирования изображений через xAI Grok API. Устанавливается как npm-пакет, предоставляет команду `grok-img`.

- **Версия**: 0.1.1
- **Лицензия**: MIT
- **Платформа**: кроссплатформенная (macOS, Windows, Linux)
- **Runtime**: Node.js >= 20.19.0, ESM

## Архитектурный стиль

Проект построен на принципах **Clean Architecture** с чётким разделением на четыре слоя. Зависимости направлены внутрь — внешние слои зависят от внутренних, но не наоборот.

```mermaid
graph TB
  subgraph presentation [Presentation Layer]
    CLI[cli.ts]
    AuthCmd[auth.command.ts]
    GenCmd[generate.command.ts]
    EditCmd[edit.command.ts]
  end

  subgraph application [Application Layer]
    GenUC[GenerateImageUseCase]
    EditUC[EditImageUseCase]
    LoginUC[LoginUseCase]
    LogoutUC[LogoutUseCase]
    AuthStatusUC[GetAuthStatusUseCase]
  end

  subgraph domain [Domain Layer]
    Entities[Entities]
    Ports[Ports]
    Errors[Errors]
  end

  subgraph infrastructure [Infrastructure Layer]
    GrokAPI[GrokApiAdapter]
    CredStore[CredentialStoreAdapter]
    FileStorage[FileStorageAdapter]
  end

  presentation --> application
  application --> domain
  infrastructure --> domain
```

## Структура проекта

```
src/
├── main.ts                          # Composition Root
├── domain/
│   ├── entities/
│   │   ├── generate-params.ts       # GenerateParams
│   │   ├── edit-params.ts           # EditParams
│   │   └── image-result.ts          # ImageResult
│   ├── errors.ts                    # ApiKeyMissingError, ApiError, ImageNotFoundError
│   └── ports/
│       ├── image-generator.port.ts  # ImageGeneratorPort
│       ├── file-storage.port.ts     # FileStoragePort
│       └── key-store.port.ts        # KeyStorePort
├── application/
│   └── usecases/
│       ├── generate-image.usecase.ts
│       ├── edit-image.usecase.ts
│       ├── login.usecase.ts
│       ├── logout.usecase.ts
│       └── get-auth-status.usecase.ts
├── infrastructure/
│   └── adapters/
│       ├── grok-api.adapter.ts              # ImageGeneratorPort → xAI SDK
│       ├── keychain.adapter.ts              # KeyStorePort → cross-keychain (OS Keychain)
│       ├── pass.adapter.ts                  # KeyStorePort → pass/gopass CLI
│       ├── env-key-store.adapter.ts         # KeyStorePort → XAI_API_KEY (read-only)
│       └── file-storage.adapter.ts          # FileStoragePort → Node.js fs
│   └── key-store-chain.ts                   # KeyStorePort (Chain of Responsibility)
└── presentation/
    ├── cli.ts                       # Commander program
    └── commands/
        ├── auth.command.ts          # login / logout / status
        ├── generate.command.ts      # generate <prompt>
        └── edit.command.ts          # edit <prompt> -i <image>
```

## Domain Layer

Ядро приложения. Не имеет внешних зависимостей.

### Сущности

| Сущность | Файл | Назначение |
|---|---|---|
| `Model` | `domain/entities/generate-params.ts` | Тип доступных моделей xAI |
| `GenerateParams` | `domain/entities/generate-params.ts` | Параметры генерации изображения |
| `EditParams` | `domain/entities/edit-params.ts` | Параметры редактирования изображения |
| `ImageResult` | `domain/entities/image-result.ts` | Результат генерации/редактирования |

Подробное описание каждой сущности — в `spec/entities/`.

### Порты

Порты определяют контракты для взаимодействия с внешними системами. Реализуются адаптерами в Infrastructure Layer.

#### ImageGeneratorPort

Файл: `domain/ports/image-generator.port.ts`

```typescript
type ImageGeneratorPort = {
  generate(params: GenerateParams, apiKey: string): Promise<ImageResult[]>
  edit(params: EditParams, apiKey: string): Promise<ImageResult>
}
```

- `generate` — генерация изображений по текстовому промпту, возвращает массив результатов
- `edit` — редактирование существующего изображения по промпту, возвращает один результат

#### KeyStorePort

Файл: `domain/ports/key-store.port.ts`

```typescript
type KeyStorePort = {
  save(key: string): Promise<void>
  get(): Promise<string | null>
  remove(): Promise<void>
}
```

- `save` — сохранить API-ключ
- `get` — получить API-ключ (или `null`, если не найден)
- `remove` — удалить API-ключ

#### FileStoragePort

Файл: `domain/ports/file-storage.port.ts`

```typescript
type FileStoragePort = {
  saveImage(data: Uint8Array, outputPath: string): Promise<string>
  readImage(filePath: string): Promise<Uint8Array>
  ensureDir(dir: string): void
  generateOutputPath(dir: string, index: number, mediaType: string): string
}
```

- `saveImage` — сохранить бинарные данные по указанному пути, вернуть путь
- `readImage` — прочитать файл изображения как `Uint8Array`
- `ensureDir` — создать директорию рекурсивно, если не существует
- `generateOutputPath` — сформировать путь для выходного файла на основе директории, индекса и MIME-типа

### Доменные ошибки

Файл: `domain/errors.ts`

| Ошибка | Когда выбрасывается |
|---|---|
| `ApiKeyMissingError` | API-ключ не найден ни в системном хранилище, ни в переменной окружения |
| `ApiError` | Ошибка при обращении к xAI API (включает `cause` для оригинальной ошибки) |
| `ImageNotFoundError` | Локальный файл изображения не существует по указанному пути |

## Application Layer

Содержит юзкейсы — бизнес-логику приложения. Зависит только от Domain Layer (сущности, порты, ошибки).

| Юзкейс | Файл | Назначение |
|---|---|---|
| `GenerateImageUseCase` | `application/usecases/generate-image.usecase.ts` | Генерация изображений и сохранение на диск |
| `EditImageUseCase` | `application/usecases/edit-image.usecase.ts` | Редактирование изображения и сохранение на диск |
| `LoginUseCase` | `application/usecases/login.usecase.ts` | Сохранение API-ключа |
| `LogoutUseCase` | `application/usecases/logout.usecase.ts` | Удаление API-ключа |
| `GetAuthStatusUseCase` | `application/usecases/get-auth-status.usecase.ts` | Проверка статуса аутентификации |

Подробное описание каждого юзкейса — в `spec/usecases/`.

## Infrastructure Layer

Реализация портов через конкретные внешние зависимости. Зависит от Domain Layer.

### GrokApiAdapter

Файл: `infrastructure/adapters/grok-api.adapter.ts`

Реализует `ImageGeneratorPort`. Использует `@ai-sdk/xai` и `ai` SDK для взаимодействия с xAI API.

- **Модель по умолчанию**: `grok-imagine-image`
- **Доступные модели**: `grok-2-image-1212`, `grok-imagine-image-pro`, `grok-imagine-image`
- **Генерация**: вызов `generateImage()` с текстовым промптом и выбранной моделью
- **Редактирование**: вызов `generateImage()` с промптом, изображением-источником (URL или `Uint8Array`) и выбранной моделью
- **Обработка ошибок**: перехват `NoImageGeneratedError` и обёртка в доменный `ApiError`

### KeyStoreChain

Файл: `infrastructure/key-store-chain.ts`

Реализует `KeyStorePort`. Цепочка хранилищ по паттерну Chain of Responsibility.
Принимает упорядоченный список именованных хранилищ и опциональный callback
`onSave(storeName)`, вызываемый при успешном сохранении.

- **save**: перебирает хранилища по порядку, сохраняет в первое доступное; при
  успехе вызывает `onSave(name)`; если все хранилища недоступны — бросает последнюю ошибку
- **get**: возвращает первый ненулевой результат из цепочки
- **remove**: удаляет из всех хранилищ (best-effort, ошибки поглощаются)

**Цепочка по умолчанию**: `KeychainAdapter → PassAdapter → EnvKeyStoreAdapter`

### KeychainAdapter

Файл: `infrastructure/adapters/keychain.adapter.ts`

Реализует `KeyStorePort`. Хранит API-ключ в нативном хранилище ОС через
библиотеку `cross-keychain`.

- **Поддерживаемые ОС**:
  - macOS — Keychain
  - Windows — Credential Manager
  - Linux — Secret Service (libsecret)
- **Service**: `grok-image-cli`
- **Account**: `api-key`
- **save**: `setPassword("grok-image-cli", "api-key", key)`
- **get**: `getPassword("grok-image-cli", "api-key")`, возвращает `null` при ошибке
- **remove**: `deletePassword("grok-image-cli", "api-key")`

### PassAdapter

Файл: `infrastructure/adapters/pass.adapter.ts`

Реализует `KeyStorePort`. Хранит API-ключ через CLI-инструмент `gopass` или `pass`
(GPG-шифрованное хранилище паролей). Работает в headless/SSH-окружениях.

- **Детектирование**: `gopass` (приоритет) → `pass`; если не найден — все методы
  бросают ошибку
- **Secret path**: `grok-image-cli/api-key`
- **save**: `gopass insert -f` / `pass insert -m --force` (stdin)
- **get**: `gopass show` / `pass show`, первая строка вывода
- **remove**: `gopass rm -f` / `pass rm --force`

### EnvKeyStoreAdapter

Файл: `infrastructure/adapters/env-key-store.adapter.ts`

Реализует `KeyStorePort`. Read-only адаптер для переменной окружения `XAI_API_KEY`.
Используется как последний fallback в цепочке.

- **get**: возвращает `process.env.XAI_API_KEY ?? null`
- **save**: бросает ошибку (переменная окружения доступна только для чтения)
- **remove**: no-op

### FileStorageAdapter

Файл: `infrastructure/adapters/file-storage.adapter.ts`

Реализует `FileStoragePort`. Работа с файловой системой через Node.js `fs`.

- **Формат имени файла**: `grok-img-{timestamp}-{index}.{ext}`
- **Поддерживаемые форматы**: `image/png` → `.png`, `image/jpeg` → `.jpg`, `image/webp` → `.webp`, `image/gif` → `.gif`
- **Формат по умолчанию**: `.png`

## Presentation Layer

CLI-интерфейс на базе `commander`. Зависит от Application Layer.

### Команды

| Команда | Описание |
|---|---|
| `grok-img auth login` | Ввод и сохранение API-ключа в системном хранилище |
| `grok-img auth logout` | Удаление API-ключа из системного хранилища |
| `grok-img auth status` | Проверка статуса аутентификации |
| `grok-img generate <prompt>` | Генерация изображений по промпту |
| `grok-img edit <prompt> -i <image>` | Редактирование изображения по промпту |

### Опции команды generate

| Опция | Описание | По умолчанию |
|---|---|---|
| `-m, --model <model>` | Модель xAI | `grok-imagine-image` |
| `-a, --aspect-ratio <ratio>` | Соотношение сторон | `auto` |
| `-n, --count <number>` | Количество изображений (1-10) | `1` |
| `-o, --output <dir>` | Директория для сохранения | `./grok-images` |

### Опции команды edit

| Опция | Описание | По умолчанию |
|---|---|---|
| `-i, --image <path>` | Исходное изображение (путь или URL) | обязательный |
| `-m, --model <model>` | Модель xAI | `grok-imagine-image` |
| `-a, --aspect-ratio <ratio>` | Соотношение сторон | `auto` |
| `-o, --output <dir>` | Директория для сохранения | `./grok-images` |

### Допустимые значения aspect-ratio

`1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `2:1`, `1:2`, `19.5:9`, `9:19.5`, `20:9`, `9:20`, `auto`

### UI-библиотеки

- `chalk` — цветной вывод в терминал
- `ora` — spinner для индикации загрузки
- `readline` — ввод API-ключа при `auth login`

## Composition Root

Файл: `src/main.ts`

Точка входа приложения. Создаёт экземпляры адаптеров, инжектирует их в юзкейсы, собирает CLI-программу и запускает парсинг аргументов.

```mermaid
graph LR
  subgraph adapters [Adapters]
    KA[CredentialStoreAdapter]
    GA[GrokApiAdapter]
    FA[FileStorageAdapter]
  end

  subgraph usecases [Use Cases]
    GenUC[GenerateImageUseCase]
    EditUC[EditImageUseCase]
    LoginUC[LoginUseCase]
    LogoutUC[LogoutUseCase]
    AuthUC[GetAuthStatusUseCase]
  end

  KA --> GenUC
  KA --> EditUC
  KA --> LoginUC
  KA --> LogoutUC
  KA --> AuthUC
  GA --> GenUC
  GA --> EditUC
  FA --> GenUC
  FA --> EditUC

  usecases --> CLIProgram[createCli]
  CLIProgram --> Parse["program.parse()"]
```

## Стек технологий

| Категория | Технология | Версия |
|---|---|---|
| Runtime | Node.js | >= 20.19.0 |
| Язык | TypeScript | 5.9.3 |
| Модули | ESM | — |
| Сборка | tsdown | 0.20.3 |
| Линтер/Форматтер | Biome | 2.3.14 |
| CLI-фреймворк | commander | 13.1.0 |
| AI SDK | @ai-sdk/xai + ai | 3.0.53 / 6.0.80 |
| Хранение ключей | cross-keychain, node:child_process | — |
| UI (терминал) | chalk, ora | 5.6.2 / 8.2.0 |

## Сборка и дистрибуция

- **Сборка**: `tsdown` собирает `src/main.ts` в `dist/main.mjs` (ESM, target Node 20)
- **Shebang**: `#!/usr/bin/env node` добавляется автоматически через banner
- **Source maps**: включены
- **Публикация**: автоматическая через GitHub Actions при создании release
- **npm-пакет**: включает `dist/`, `README.md`, `LICENSE`

## Безопасность

- API-ключ хранится через цепочку резервных хранилищ:
  1. **Keychain** — нативное хранилище ОС (macOS Keychain / Windows Credential Manager / Linux Secret Service)
  2. **pass/gopass** — GPG-шифрованное CLI-хранилище паролей; работает в headless/SSH-окружениях
  3. **XAI_API_KEY** — переменная окружения (только для чтения, используется как последний fallback)
- При сохранении ключа пользователю выводится сообщение о том, в какое хранилище он записан
- Все запросы к API — по HTTPS
- При отображении ключа в `auth status` — маскировка (первые 4 + последние 4 символа)
