# GenerateParams

Параметры для генерации изображений.

**Файл**: `src/domain/entities/generate-params.ts`

## Определение

```typescript
type GenerateParams = {
  prompt: string
  count: number
  aspectRatio: string
}
```

## Поля

| Поле | Тип | Описание |
|---|---|---|
| `prompt` | `string` | Текстовое описание изображения для генерации |
| `count` | `number` | Количество изображений для генерации |
| `aspectRatio` | `string` | Соотношение сторон результата |

## Ограничения

- `prompt` — непустая строка, передаётся напрямую в xAI API
- `count` — целое число от 1 до 10 (валидация на уровне Presentation Layer)
- `aspectRatio` — одно из допустимых значений: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `2:1`, `1:2`, `19.5:9`, `9:19.5`, `20:9`, `9:20`, `auto` (валидация на уровне Presentation Layer)

## Использование

- Создаётся в `generate.command.ts` из аргументов CLI
- Передаётся в `GenerateImageUseCase.execute()`
- Далее передаётся в `ImageGeneratorPort.generate()`
