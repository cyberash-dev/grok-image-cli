# EditImageUseCase

Редактирование существующего изображения по текстовому промпту и сохранение результата на диск.

**Файл**: `src/application/usecases/edit-image.usecase.ts`

## Зависимости (порты)

| Порт | Назначение |
|---|---|
| `ImageGeneratorPort` | Редактирование изображения через xAI API |
| `KeyStorePort` | Получение API-ключа |
| `FileStoragePort` | Чтение исходного и сохранение результата |

## Сигнатура

```typescript
execute(params: EditParams, outputDir: string): Promise<string>
```

## Входные параметры

| Параметр | Тип | Описание |
|---|---|---|
| `params` | `EditParams` | Параметры редактирования (prompt, imageSource, aspectRatio, model) |
| `outputDir` | `string` | Абсолютный путь к директории для сохранения |

## Выходные данные

`string` — абсолютный путь к сохранённому файлу.

## Алгоритм

```mermaid
flowchart TD
  A[Получить API-ключ из KeyStorePort] --> B{Ключ найден?}
  B -->|Нет| C[Выбросить ApiKeyMissingError]
  B -->|Да| D{imageSource — локальный путь?}
  D -->|Да| E[Прочитать файл через readImage]
  D -->|Нет| F[Оставить как есть — URL]
  E --> G[Создать директорию outputDir]
  F --> G
  G --> H[Вызвать ImageGeneratorPort.edit]
  H --> I[Сформировать путь через generateOutputPath]
  I --> J[Сохранить файл через saveImage]
  J --> K[Вернуть путь]
```

1. Получить API-ключ через `keyStore.get()`
2. Если ключ не найден — выбросить `ApiKeyMissingError`
3. Если `imageSource` — строка, не начинающаяся с `http`:
   - Прочитать файл через `fileStorage.readImage(imageSource)` → `Uint8Array`
   - Заменить `imageSource` в параметрах на бинарные данные
4. Создать выходную директорию через `fileStorage.ensureDir(outputDir)`
5. Вызвать `imageGenerator.edit(params, apiKey)` — получить `ImageResult`
6. Сформировать путь через `fileStorage.generateOutputPath(outputDir, 0, mediaType)`
7. Сохранить файл через `fileStorage.saveImage(uint8Array, outputPath)`
8. Вернуть путь

## Ошибки

| Ошибка | Условие |
|---|---|
| `ApiKeyMissingError` | API-ключ не найден |
| `ImageNotFoundError` | Локальный файл изображения не существует |
| `ApiError` | Ошибка xAI API при редактировании |
