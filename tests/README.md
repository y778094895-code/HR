# Smart Performance System - Testing Guide

This directory contains the comprehensive test suite for the Smart Performance System.

## Structure

- **unit/**: Unit tests for individual components (Frontend, Backend, ML, Infrastructure).
- **integration/**: Integration tests between layers (Gateway, Backend, DB, Broker).
- **e2e/**: End-to-End tests for critical user journeys.
- **performance/**: Performance and load tests (k6).

## Running Tests

### Prerequisites
- Node.js & npm/pnpm
- Docker & Docker Compose
- Python 3.9+ (for ML service tests)

### Unit Tests

**Frontend:**
```bash
cd client
npm run test
```

**Backend:**
```bash
cd server
npm run test
```

**ML Service:**
```bash
cd ml-service
pytest
```

### Integration Tests

Run the integration test suite (requires Docker):
```bash
npm run test:integration
```
*(Note: Ensure docker-compose.test.yml is running)*

### End-to-End Tests

```bash
npm run test:e2e
```

### Performance Tests

(Requires k6 installed)
```bash
k6 run tests/performance/load-test.js
```
