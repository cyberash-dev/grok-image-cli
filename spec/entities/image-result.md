# ImageResult

Результат генерации или редактирования изображения, возвращаемый из xAI API.

**Файл**: `src/domain/entities/image-result.ts`

## Определение

```typescript
type ImageResult = {
  base64: string
  uint8Array: Uint8Array
  mediaType: string
}
```

## Поля

| Поле | Тип | Описание |
|---|---|---|
| `base64` | `string` | Изображение в кодировке Base64 |
| `uint8Array` | `Uint8Array` | Бинарные данные изображения |
| `mediaType` | `string` | MIME-тип изображения |

## Ограничения

- `mediaType` — одно из значений: `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- `uint8Array` используется для сохранения файла на диск через `FileStoragePort.saveImage()`
- `mediaType` используется для определения расширения файла в `FileStoragePort.generateOutputPath()`

## Использование

- Создаётся в `GrokApiAdapter` из ответа xAI API
- Возвращается из `ImageGeneratorPort.generate()` (массив `ImageResult[]`) и `ImageGeneratorPort.edit()` (один `ImageResult`)
- Обрабатывается в юзкейсах `GenerateImageUseCase` и `EditImageUseCase` для сохранения на диск
