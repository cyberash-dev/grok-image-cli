# EditParams

Параметры для редактирования изображения.

**Файл**: `src/domain/entities/edit-params.ts`

## Определение

```typescript
type EditParams = {
  prompt: string
  imageSource: string | Uint8Array
  aspectRatio: string
}
```

## Поля

| Поле | Тип | Описание |
|---|---|---|
| `prompt` | `string` | Текстовое описание редактирования |
| `imageSource` | `string \| Uint8Array` | Источник изображения |
| `aspectRatio` | `string` | Соотношение сторон результата |

## Ограничения

- `prompt` — непустая строка, передаётся в xAI API
- `imageSource` — принимает три формата:
  - **Локальный путь** (`string`, не начинается с `http`) — будет прочитан через `FileStoragePort.readImage()` в `EditImageUseCase` и преобразован в `Uint8Array`
  - **URL** (`string`, начинается с `http`) — передаётся в API как `new URL(imageSource)`
  - **Бинарные данные** (`Uint8Array`) — передаются в API напрямую
- `aspectRatio` — одно из допустимых значений: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `2:1`, `1:2`, `19.5:9`, `9:19.5`, `20:9`, `9:20`, `auto` (валидация на уровне Presentation Layer)

## Использование

- Создаётся в `edit.command.ts` из аргументов CLI
- Передаётся в `EditImageUseCase.execute()`
- В юзкейсе `imageSource` может быть преобразован из пути в `Uint8Array`
- Далее передаётся в `ImageGeneratorPort.edit()`
