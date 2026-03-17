# Canonical API Route Map for P0 (Unified Contract)

All frontend calls `/api/*` via gateway → backend `/api/*`.

**Response Envelope**: `{ success: bool, message, data?, error?: { code, message, details? }, timestamp }`

## Auth (Public)
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| POST | /auth/login | /api/auth/login |
| POST | /auth/register | /api/auth/register |

## Auth (Protected)
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /auth/me | /api/auth/me |
| POST | /auth/logout | /api/auth/logout |
| POST | /auth/refresh-token | /api/auth/refresh-token |

## Settings → `/api/console/v1/settings/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /settings/organization | /api/console/v1/settings/organization |
| PUT | /settings/organization | /api/console/v1/settings/organization |
| GET | /settings/profile | /api/console/v1/settings/profile |
| PUT | /settings/profile | /api/console/v1/settings/profile |

## Notifications → `/api/console/v1/settings/notifications`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /notifications | /api/console/v1/settings/notifications |
| PUT | /notifications | /api/console/v1/settings/notifications |

## Security → `/api/console/v1/settings/security/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /security/settings | /api/console/v1/settings/security/settings |
| PUT | /security/settings | /api/console/v1/settings/security/settings |
| GET | /security/2fa/status | /api/console/v1/settings/security/2fa/status |
| POST | /security/2fa/enable | /api/console/v1/settings/security/2fa/enable |
| POST | /security/2fa/disable | /api/console/v1/settings/security/2fa/disable |
| POST | /security/2fa/verify | /api/console/v1/settings/security/2fa/verify |
| POST | /security/password/change | /api/console/v1/settings/security/password/change |

## Sessions → `/api/console/v1/settings/security/sessions/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /sessions | /api/console/v1/settings/security/sessions |
| DELETE | /sessions/:id | /api/console/v1/settings/security/sessions/:id |

## Appearance → `/api/console/v1/settings/appearance`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /appearance | /api/console/v1/settings/appearance |
| PUT | /appearance | /api/console/v1/settings/appearance |

## Integrations → `/api/console/v1/settings/integrations/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /integrations | /api/console/v1/settings/integrations |
| GET | /integrations/:id | /api/console/v1/settings/integrations/:id |
| POST | /integrations/:id/connect | /api/console/v1/settings/integrations/:id/connect |
| POST | /integrations/:id/disconnect | /api/console/v1/settings/integrations/:id/disconnect |
| POST | /integrations/:id/sync | /api/console/v1/settings/integrations/:id/sync |
| POST | /integrations/:id/reconnect | /api/console/v1/settings/integrations/:id/reconnect |
| PUT | /integrations/:id/config | /api/console/v1/settings/integrations/:id/config |
| POST | /integrations/:id/test | /api/console/v1/settings/integrations/:id/test |

## Performance → `/api/performance/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /performance/overview | /api/performance/overview |
| GET | /performance/employees | /api/performance/employees |
| GET | /performance/departments | /api/performance/departments |
| GET | /performance/recommendations | /api/performance/recommendations |
| GET | /performance/employees/:id | /api/performance/employees/:id |

## Reports → `/api/reports/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /reports/templates | /api/reports/templates |
| POST | /reports/jobs | /api/reports/jobs |
| GET | /reports/jobs/:id | /api/reports/jobs/:id |
| GET | /reports/jobs/:id/download | /api/reports/jobs/:id/download |

## Turnover → `/api/turnover/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /turnover/metrics | /api/turnover/metrics |
| GET | /turnover/risks | /api/turnover/risks |
| GET | /turnover/risks/:id | /api/turnover/risks/:id |
| POST | /turnover/predict/:id | /api/turnover/predict/:id |

## Training → `/api/training/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /training/skills/:id/gaps | /api/training/skills/:id/gaps |
| GET | /training/recommendations | /api/training/recommendations |
| POST | /training/recommendations/:id/approve | /api/training/recommendations/:id/approve |
| POST | /training/recommendations/:id/reject | /api/training/recommendations/:id/reject |
| GET | /training/effectiveness | /api/training/effectiveness |

## Fairness → `/api/fairness/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /fairness/metrics | /api/fairness/metrics |
| GET | /fairness/comparison | /api/fairness/comparison |
| GET | /fairness/recommendations | /api/fairness/recommendations |
| POST | /fairness/analyze | /api/fairness/analyze |
| GET | /fairness/matrix | /api/fairness/matrix |
| GET | /fairness/gap-analysis | /api/fairness/gap-analysis |

## Data Quality → `/api/console/v1/data-quality/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /quality/issues | /api/console/v1/data-quality/issues |
| GET | /quality/summary | /api/console/v1/data-quality/summary |
| GET | /quality/sources | /api/console/v1/data-quality/sources |
| GET | /quality/health | /api/console/v1/data-quality/sources/health |
| PATCH | /quality/issues/:id | /api/console/v1/data-quality/issues/:id |
| POST | /quality/scan | /api/console/v1/data-quality/scan |

## Help → `/api/console/v1/help/*`
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /help/categories | /api/console/v1/help/categories |
| GET | /help/categories/:id/articles | /api/console/v1/help/categories/:id/articles |
| GET | /help/articles | /api/console/v1/help/articles |
| GET | /help/articles/popular | /api/console/v1/help/articles/popular |
| GET | /help/articles/search | /api/console/v1/help/articles/search |
| GET | /help/articles/:slug | /api/console/v1/help/articles/:slug |
| GET | /help/faqs | /api/console/v1/help/faqs |

## Support (alias → Help tickets)
| Method | Gateway Path | Backend Path |
|--------|-------------|-------------|
| GET | /support/tickets | /api/console/v1/help/tickets |
| POST | /support/tickets | /api/console/v1/help/tickets |
| GET | /support/tickets/:id | /api/console/v1/help/tickets/:id |
| PATCH | /support/tickets/:id | /api/console/v1/help/tickets/:id |
| POST | /support/tickets/:id/messages | /api/console/v1/help/tickets/:id/messages |
