/**
 * Controller registry — side-effect imports only.
 * Each import registers its @controller routes with inversify-express-utils.
 * Mount paths are declared via @controller() decorators inside each file.
 *
 * Canonical route map (rootPath = /api):
 *   /api/auth              → auth.controller
 *   /api/employees         → employee.controller
 *   /api/performance       → performance.controller
 *   /api/turnover          → turnover.controller
 *   /api/training          → training.controller
 *   /api/fairness          → fairness.controller
 *   /api/interventions     → intervention.controller
 *   /api/recommendations   → recommendation.controller
 *   /api/impact            → impact.controller
 *   /api/alerts            → alerts.controller
 *   /api/reports           → reports.controller
 *   /api/users             → users.controller
 *   /api/ml                → ml.controller
 *   /api/dashboard         → dashboard.controller
 *   /api/console           → console-bff.controller
 *   /api/console/v1/settings    → console-settings.controller
 *   /api/console/v1/help        → console-help.controller
 *   /api/console/v1/data-quality → console-dataquality.controller
 */

import './controllers/auth.controller';
import './controllers/employee.controller';
import './controllers/performance.controller';
import './controllers/turnover.controller';
import './controllers/training.controller';
import './controllers/fairness.controller';
import './controllers/intervention.controller';
import './controllers/recommendation.controller';
import './controllers/impact.controller';
import './controllers/alerts.controller';
import './controllers/reports.controller';
import './controllers/users.controller';
import './controllers/ml.controller';
import './controllers/dashboard.controller';
import './controllers/console-bff.controller';
import './controllers/console-settings.controller';
import './controllers/console-help.controller';
import './controllers/console-dataquality.controller';
import './controllers/cases.controller';
import './controllers/salary.controller';
import './controllers/attendance.controller';
import './controllers/notifications.controller';
import './controllers/goals.controller';
import './controllers/reviews.controller';
import './controllers/analytics.controller';
