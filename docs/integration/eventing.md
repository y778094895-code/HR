# Event-Driven Architecture

## 1. Overview
Services communicate asynchronously via RabbitMQ to decouple business logic and ensure scalability. The system implements the **Outbox Pattern** to guarantee at-least-once delivery.

## 2. Event Structure
Standard CloudEvents-like structure:
```json
{
  "eventType": "string",
  "data": {},
  "timestamp": "ISO8601",
  "traceId": "uuid",
  "messageId": "uuid"
}
```

## 3. Exchanges & Topics
| Exchange | Type | Purpose | Topics |
|---|---|---|---|
| `employee.events` | Topic | Employee lifecycle | `employee.created`, `employee.updated` |
| `fairness.events` | Topic | Bias detection | `fairness.analyzed` |
| `intervention.events` | Topic | Recommended actions | `intervention.created` |
| `turnover.events` | Topic | Risk assessment | `turnover.risk.updated` |
| `notification.events` | Topic | User alerts | `notification.sent` |

## 4. Key Event Flows
### Flow 1: Turnover Risk Assessment
1. **Employee Service**: Creates employee, inserts `employee.created` into `outbox` table (Transaction).
2. **Outbox Processor**: Polls `outbox`, publishes to `employee.events`.
3. **ML Service**: Consumes `employee.created`, calculates risk, publishes `turnover.risk.updated`.
4. **Notification Service**: Consumes `turnover.risk.updated`. If `riskLevel` is HIGH, sends alert.

## 5. Reliability Patterns
- **Outbox Pattern**: Events are stored in DB transaction before publishing.
  - Schema: `server/data/models/outbox.schema.ts`
  - Service: `server/shared/infrastructure/outbox.service.ts`
- **Idempotency**: Consumers verify `messageId` against Redis/Cache before processing.
- **Dead Letter Queue (DLQ)**: Failed messages are routed to `dlq.exchange` after retries.
- **Tracing**: Trace IDs are propagated in event headers `x-trace-id`.
