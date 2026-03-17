# Environment Setup Guide

## Overview
This document guides you through setting up the environment variables for the Smart HR Performance Management System. It lists the active variables and their purpose.

## Quick Start
1. Copy `.env.example` to create a new `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
2. The `.env` file comes pre-configured with default values for local development.

## Active Environment Variables

### Backend Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode (development/production) |
| `BACKEND_PORT` | `3000` | Port for the backend service |
| `BACKEND_HOST` | `0.0.0.0` | Host address to bind to |
| `JWT_SECRET` | *[Change Me]* | Secret key for signing JWT tokens |

### Frontend Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_PORT` | `3001` | Port for the React frontend application |
| `REACT_APP_API_URL` | `http://localhost:3000/api` | Base URL for API requests |

### Security
| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGIN` | `http://localhost:3001` | Allowed origin for CORS requests (must match Frontend Port) |

### Database
| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `postgres` | Database hostname (use `localhost` if running outside Docker) |
| `DB_PORT` | `5432` | Database port |
| `DB_NAME` | `hr_system` | Database name |
| `DB_USER` | `hr` | Database user |
| `DB_PASSWORD` | `saeed` | Database password |

### Other Services
- **ML Service**: Port `8000`
- **Redis**: Port `6379`
- **Nginx**: Ports `80` (HTTP) & `443` (HTTPS)
- **Monitoring**: Prometheus (`9090`), Grafana (`3002`), Loki (`3100`)

## Notes
- Ensure `CORS_ORIGIN` exactly matches the URL where you are running the frontend.
- Change all secrets (JWT, database passwords) before deploying to production.
