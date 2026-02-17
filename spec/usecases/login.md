# LoginUseCase

Сохранение API-ключа xAI в безопасное хранилище.

**Файл**: `src/application/usecases/login.usecase.ts`

## Зависимости (порты)

| Порт | Назначение |
|---|---|
| `KeyStorePort` | Сохранение API-ключа |

## Сигнатура

```typescript
execute(apiKey: string): Promise<void>
```

## Входные параметры

| Параметр | Тип | Описание |
|---|---|---|
| `apiKey` | `string` | API-ключ xAI для сохранения |

## Выходные данные

`void` — операция не возвращает значения.

## Алгоритм

1. Вызвать `keyStore.save(apiKey)`

## Поведение на уровне Presentation

Команда `grok-img auth login`:
1. Запрашивает API-ключ у пользователя через `readline`
2. Если ключ не введён — выводит ошибку и завершает процесс
3. Вызывает `LoginUseCase.execute(apiKey)`
4. Выводит сообщение об успешном сохранении в системное хранилище
