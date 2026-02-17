# LogoutUseCase

Удаление API-ключа xAI из безопасного хранилища.

**Файл**: `src/application/usecases/logout.usecase.ts`

## Зависимости (порты)

| Порт | Назначение |
|---|---|
| `KeyStorePort` | Удаление API-ключа |

## Сигнатура

```typescript
execute(): Promise<void>
```

## Входные параметры

Нет.

## Выходные данные

`void` — операция не возвращает значения.

## Алгоритм

1. Вызвать `keyStore.remove()`

## Поведение на уровне Presentation

Команда `grok-img auth logout`:
1. Вызывает `LogoutUseCase.execute()`
2. Выводит сообщение об успешном удалении
3. При ошибке — выводит сообщение и завершает процесс
