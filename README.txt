# Payroll Simulation Engine

A transactional payroll processing simulation built with Node.js, TypeScript, PostgreSQL, and Redis.

This project demonstrates financial data integrity, idempotent operations, distributed job processing, and concurrency-safe database design.

---

## Overview

The Payroll Simulation Engine models a backend service responsible for processing payroll runs in a transactional and concurrency-safe manner.

It is designed to showcase:

- Transaction management
- Idempotency enforcement
- Distributed worker patterns
- Safe concurrent processing
- Financial calculation logic
- Clean architecture separation

This project focuses on correctness and system design principles commonly required in financial systems.

---

## Architecture

The application follows a layered architecture:

- Controllers → Handle HTTP input/output
- Services → Contain business logic
- Repositories → Manage database interactions
- Workers → Process queued background jobs
- Schemas → Validate request payloads
- Database → PostgreSQL with transaction support
- Queue → Redis-backed worker queue

### High-Level Flow

1. Client creates a payroll run
2. Payroll run is stored with status `queued`
3. Worker claims job using conditional update
4. Database transaction begins
5. Employee pay calculations are processed
6. Tax logic is applied
7. Ledger entries are created
8. Audit record is written
9. Transaction commits
10. Payroll run status updates to `completed`

If any step fails, the transaction rolls back.

---

## Key Features

### Transaction-Safe Payroll Runs

All payroll processing occurs inside a database transaction to guarantee atomicity.

### Idempotency Key Enforcement

Each payroll run requires an idempotency key.
Duplicate requests with the same key will not create multiple payroll runs.

### Concurrency Protection

Jobs are claimed using conditional row updates to prevent multiple workers from processing the same payroll run.

Pattern used:

- Update where status = 'queued'
- Return row only if successfully claimed

This prevents race conditions.

### Redis Job Queue

Workers use Redis to process queued jobs asynchronously.

- Jobs pushed to `job_queue`
- Worker blocks using BRPOP
- Retry logic supported
- Status transitions tracked in database

### Audit Logging

Every payroll run creates an audit entry to ensure traceability.

---

## Tech Stack

- Node.js
- TypeScript
- PostgreSQL
- Redis
- Zod for validation
- Docker (optional)

---

## Project Structure

```
payroll-sim-engine/
│
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── workers/
│   ├── schemas/
│   ├── db/
│   └── app.ts
│
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## Running Locally

### 1. Clone the repository

```
git clone https://github.com/yourusername/payroll-sim-engine.git
cd payroll-sim-engine
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example`.

Example:

```
DATABASE_URL=postgres://user:password@localhost:5432/payroll
REDIS_URL=redis://localhost:6379
```

### 4. Start services

If using Docker:

```
docker-compose up --build
```

Or run manually:

```
npm run dev
```

Start worker separately:

```
npm run worker
```

---

## Example API Flow

### Create Payroll Run

POST `/payroll/run`

Body:

```
{
  "periodStart": "2026-02-01",
  "periodEnd": "2026-02-15",
  "idempotencyKey": "run-2026-02-15"
}
```

Response:

```
{
  "status": "queued",
  "runId": "uuid"
}
```

Worker processes asynchronously.

---

## Design Considerations

### Why Idempotency Matters

In financial systems, retries can occur due to network failures.
Without idempotency enforcement, duplicate payroll runs could occur.

### Why Transactions Are Required

Payroll processing modifies multiple tables:

- Payroll runs
- Employee payments
- Ledger entries
- Audit logs

All writes must succeed or fail together.

### Why Workers Are Used

Payroll runs can be compute-heavy.
Using a queue allows asynchronous processing and system scalability.

---

## Future Improvements

- Dead letter queue
- Exponential retry backoff
- Metrics and structured logging
- OpenAPI documentation
- Rate limiting
- Integration test suite
- Event-driven outbox pattern

---

## Purpose of This Project

This project demonstrates backend engineering patterns relevant to:

- Fintech systems
- Payroll systems
- Distributed services
- Event-driven architectures
- Concurrency-safe design

It is intended as a portfolio project showcasing production-grade backend concepts.