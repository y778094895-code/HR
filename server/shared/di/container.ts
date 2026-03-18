import { Container } from 'inversify';
import 'reflect-metadata';
import { DatabaseConnection } from '../../data/database/connection';

// Repositories
import { EmployeeRepository } from '../../data/repositories/employee.repository';
import { FairnessRepository } from '../../data/repositories/fairness.repository';
import { InterventionRepository } from '../../data/repositories/intervention.repository';
import { PerformanceRepository } from '../../data/repositories/performance.repository';
import { RecommendationRepository } from '../../data/repositories/recommendation.repository';
import { TurnoverRepository } from '../../data/repositories/turnover.repository';
import { TrainingRepository } from '../../data/repositories/training.repository';
import { ReportsRepository } from '../../data/repositories/reports.repository';
import { AlertsRepository } from '../../data/repositories/alerts.repository';
import { RiskCaseRepository } from '../../data/repositories/riskCase.repository';
import { RiskCaseService } from '../../services/business/risk-case.service';
import { IRiskCaseService } from '../../services/interfaces/i-risk-case.service';

// Services
import { IEmployeeService } from '../../services/interfaces/i-employee.service';
import { IMLServiceClient } from '../../services/interfaces/i-ml.service.client';
import { EmployeeService } from '../../services/business/employee.service';
import { IFairnessService } from '../../services/interfaces/i-fairness.service';
import { FairnessService } from '../../services/business/fairness.service';
import { IInterventionService } from '../../services/interfaces/i-intervention.service';
import { InterventionService } from '../../services/business/intervention.service';
import { IPerformanceService } from '../../services/interfaces/i-performance.service';
import { PerformanceService } from '../../services/business/performance.service';
import { IRecommendationService } from '../../services/interfaces/i-recommendation.service';
import { RecommendationService } from '../../services/business/recommendation.service';
import { ITrainingService } from '../../services/interfaces/i-training.service';
import { TrainingService } from '../../services/business/training.service';
import { IReportsService } from '../../services/interfaces/i-reports.service';
import { IAlertsService } from '../../services/interfaces/i-alerts.service';
import { ReportsService } from '../../services/business/reports.service';
import { AlertsService } from '../../services/business/alerts.service';
import { IImpactService } from '../../services/interfaces/i-impact.service';
import { ImpactService } from '../../services/business/impact.service';
import { OutboxService } from '../../shared/infrastructure/outbox.service';
import { NotificationService } from '../../services/business/notification.service';

// External
import { MLServiceClient } from '../../data/external/ml.service.client';
import { ERPNextClient } from '../../data/external/erpnext.client';

import { UserRepository } from '../../data/repositories/user.repository';
import { AuthService } from '../../services/business/auth.service';
import { AuthMiddleware } from '../../api/middleware/auth.middleware';
import { CorrelationIdMiddleware } from '../../api/middleware/correlation-id.middleware';
import { AuditMiddleware } from '../../api/middleware/audit.middleware';
import { RbacMiddleware } from '../../api/middleware/rbac.middleware';
import { AuditLogService } from '../../services/business/audit-log.service';

// Controllers
import { EmployeeController } from '../../api/controllers/employee.controller';
import { FairnessController } from '../../api/controllers/fairness.controller';
import { InterventionController } from '../../api/controllers/intervention.controller';
import { PerformanceController } from '../../api/controllers/performance.controller';
import { RecommendationController } from '../../api/controllers/recommendation.controller';
import { DashboardController } from '../../api/controllers/dashboard.controller';
import { ConsoleBffController } from '../../api/controllers/console-bff.controller';
import { TurnoverController } from '../../api/controllers/turnover.controller';
import { TrainingController } from '../../api/controllers/training.controller';
import { ReportsController } from '../../api/controllers/reports.controller';
import { AlertsController } from '../../api/controllers/alerts.controller';
import { UsersController } from '../../api/controllers/users.controller';
import { ImpactController } from '../../api/controllers/impact.controller';
import { MLController } from '../../api/controllers/ml.controller';
import { ConsoleSettingsController, IntegrationsController } from '../../api/controllers/console-settings.controller';
import { ConsoleHelpController, SupportController } from '../../api/controllers/console-help.controller';
import { ConsoleDataQualityController } from '../../api/controllers/console-dataquality.controller';
import { CasesController } from '../../api/controllers/cases.controller';
import { SalaryController } from '../../api/controllers/salary.controller';
import { TurnoverService } from '../../services/business/turnover.service';
import { ProfileAggregatorService } from '../../services/business/profile-aggregator.service';
import { DashboardService } from '../../services/application/dashboard.service';
import { SalaryRepository } from '../../data/repositories/salary.repository';
import { ISalaryService } from '../../services/interfaces/i-salary.service';
import { SalaryService } from '../../services/business/salary.service';
import { AttendanceController } from '../../api/controllers/attendance.controller';
import { AttendanceRepository } from '../../data/repositories/attendance.repository';
import { IAttendanceService } from '../../services/interfaces/i-attendance.service';
import { AttendanceService } from '../../services/business/attendance.service';
import { NotificationsController } from '../../api/controllers/notifications.controller';
import { NotificationsRepository } from '../../data/repositories/notifications.repository';
import { GoalsRepository } from '../../data/repositories/goals.repository';
import { GoalsService } from '../../services/business/goals.service';
import { ReviewsRepository } from '../../data/repositories/reviews.repository';
import { ReviewsService } from '../../services/business/reviews.service';
import { XaiService } from '../../services/business/xai.service';
import { AnalyticsService } from '../../services/business/analytics.service';
import { ExportService } from '../../services/business/export.service';
import { AnalyticsController } from '../../api/controllers/analytics.controller';
import {
    GoalsController,
    OrgObjectivesController,
} from '../../api/controllers/goals.controller';
import {
    ReviewTemplatesController,
    ReviewCyclesController,
    ReviewsController,
} from '../../api/controllers/reviews.controller';

// Shared
import { ServiceFactory } from '../../shared/factories/service.factory';
import { ModuleManager } from '../../shared/modules/module.manager';

export class DIContainer {
    private static instance: DIContainer;
    public container: Container;

    private constructor() {
        this.container = new Container();
        this.setupBindings();
    }

    static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    private setupBindings(): void {
        // Core
        this.container.bind<DatabaseConnection>('DatabaseConnection').to(DatabaseConnection).inSingletonScope();
        this.container.bind<ModuleManager>('ModuleManager').to(ModuleManager).inSingletonScope();

        // External
        this.container.bind<MLServiceClient>('MLServiceClient').to(MLServiceClient).inSingletonScope();
        this.container.bind<ERPNextClient>('ERPNextClient').to(ERPNextClient).inSingletonScope();

        // Repositories
        this.container.bind<EmployeeRepository>('EmployeeRepository').to(EmployeeRepository);
        this.container.bind<FairnessRepository>('FairnessRepository').to(FairnessRepository);
        this.container.bind<InterventionRepository>('InterventionRepository').to(InterventionRepository);
        this.container.bind<PerformanceRepository>('PerformanceRepository').to(PerformanceRepository);
        this.container.bind<RecommendationRepository>('RecommendationRepository').to(RecommendationRepository);
        this.container.bind<TurnoverRepository>('TurnoverRepository').to(TurnoverRepository);
        this.container.bind<TrainingRepository>('TrainingRepository').to(TrainingRepository);
        this.container.bind<ReportsRepository>('ReportsRepository').to(ReportsRepository);
        this.container.bind<AlertsRepository>('AlertsRepository').to(AlertsRepository);
        this.container.bind<RiskCaseRepository>('RiskCaseRepository').toDynamicValue((context) => {
            const db = context.container.get<DatabaseConnection>('DatabaseConnection');
            return new RiskCaseRepository(db);
        });
        this.container.bind<IRiskCaseService>('IRiskCaseService').to(RiskCaseService);

        // Salary
        this.container.bind<SalaryRepository>('SalaryRepository').to(SalaryRepository);
        this.container.bind<ISalaryService>('ISalaryService').to(SalaryService);

        // Attendance
        this.container.bind<AttendanceRepository>('AttendanceRepository').to(AttendanceRepository);
        this.container.bind<IAttendanceService>('IAttendanceService').to(AttendanceService);

        // Notifications
        this.container.bind<NotificationsRepository>('NotificationsRepository').to(NotificationsRepository);

        // XAI
        this.container.bind<XaiService>(XaiService).toSelf().inSingletonScope();

        // Analytics & Export
        this.container.bind<AnalyticsService>(AnalyticsService).toSelf().inSingletonScope();
        this.container.bind<ExportService>(ExportService).toSelf();

        // Goals & Objectives
        this.container.bind<GoalsRepository>(GoalsRepository).toSelf();
        this.container.bind<GoalsService>(GoalsService).toSelf();

        // Reviews
        this.container.bind<ReviewsRepository>(ReviewsRepository).toSelf();
        this.container.bind<ReviewsService>(ReviewsService).toSelf();

        // Services (Bind interfaces to implementations)
        this.container.bind<IEmployeeService>('IEmployeeService').to(EmployeeService);
        this.container.bind<IFairnessService>('IFairnessService').to(FairnessService);
        this.container.bind<IInterventionService>('IInterventionService').to(InterventionService);
        this.container.bind<IPerformanceService>('IPerformanceService').to(PerformanceService);
        this.container.bind<IRecommendationService>('IRecommendationService').to(RecommendationService);
        this.container.bind<ITrainingService>('ITrainingService').to(TrainingService);
        this.container.bind<IReportsService>('IReportsService').to(ReportsService);
        this.container.bind<IAlertsService>('IAlertsService').to(AlertsService);
        this.container.bind<IImpactService>('IImpactService').to(ImpactService);
        this.container.bind<IMLServiceClient>('IMLServiceClient').to(MLServiceClient);

        // Infrastructure Services
        this.container.bind<OutboxService>('OutboxService').to(OutboxService).inSingletonScope();
        this.container.bind<NotificationService>('NotificationService').to(NotificationService).inSingletonScope();

        // Auth
        this.container.bind<UserRepository>('UserRepository').to(UserRepository);
        this.container.bind<AuthService>('AuthService').toDynamicValue((context) => {
            const userRepo = context.container.get<UserRepository>('UserRepository');
            const sessionsRepo = context.container.get<any>('SessionsRepository');
            const dbConnection = context.container.get<DatabaseConnection>('DatabaseConnection');
            return new AuthService(userRepo, sessionsRepo, dbConnection);
        });
        this.container.bind<AuthMiddleware>(AuthMiddleware).toSelf();
        this.container.bind<AuthMiddleware>('AuthMiddleware').to(AuthMiddleware);
        this.container.bind<CorrelationIdMiddleware>(CorrelationIdMiddleware).toSelf();
        this.container.bind<AuditMiddleware>(AuditMiddleware).toSelf();
        this.container.bind<RbacMiddleware>('RbacMiddleware').to(RbacMiddleware);
        this.container.bind<AuditLogService>('AuditLogService').to(AuditLogService).inSingletonScope();

        // Phase E Repos
        this.container.bind('SettingsRepository').toDynamicValue((context) => {
            const db = context.container.get<DatabaseConnection>('DatabaseConnection');
            return new (require('../../data/repositories/settings.repository').SettingsRepository)(db);
        });
        this.container.bind('SessionsRepository').toDynamicValue((context) => {
            const db = context.container.get<DatabaseConnection>('DatabaseConnection');
            return new (require('../../data/repositories/sessions.repository').SessionsRepository)(db);
        });
        this.container.bind('IntegrationsRepository').toDynamicValue((context) => {
            const db = context.container.get<DatabaseConnection>('DatabaseConnection');
            return new (require('../../data/repositories/integrations.repository').IntegrationsRepository)(db);
        });
        this.container.bind('DataQualityRepository').toDynamicValue((context) => {
            const db = context.container.get<DatabaseConnection>('DatabaseConnection');
            return new (require('../../data/repositories/dataquality.repository').DataQualityRepository)(db);
        });
        this.container.bind('SettingsService').toDynamicValue((context) => {
            return new (require('../../services/business/settings.service').SettingsService)(
                context.container.get('SettingsRepository'),
                context.container.get('UserRepository'),
                context.container.get('AuditLogService')
            );
        });
        this.container.bind('SupportRepository').toDynamicValue((context) => {
            const db = context.container.get<DatabaseConnection>('DatabaseConnection');
            return new (require('../../data/repositories/support.repository').SupportRepository)(db);
        });
        this.container.bind('HelpRepository').toDynamicValue((context) => {
            const db = context.container.get<DatabaseConnection>('DatabaseConnection');
            return new (require('../../data/repositories/help.repository').HelpRepository)(db);
        });
        this.container.bind('HelpService').toDynamicValue((context) => {
            return new (require('../../services/business/help.service').HelpService)(
                context.container.get('HelpRepository'),
                context.container.get('SupportRepository'),
                context.container.get('AuditLogService')
            );
        });
        this.container.bind('DataQualityService').toDynamicValue((context) => {
            return new (require('../../services/business/dataquality.service').DataQualityService)(
                context.container.get('DataQualityRepository'),
                context.container.get('AuditLogService')
            );
        });

        // Console controllers — use class constructors with toSelf()
        this.container.bind<ConsoleSettingsController>(ConsoleSettingsController).toSelf();
        this.container.bind<IntegrationsController>(IntegrationsController).toSelf();
        this.container.bind<ConsoleHelpController>(ConsoleHelpController).toSelf();
        this.container.bind<SupportController>(SupportController).toSelf();
        this.container.bind<ConsoleDataQualityController>(ConsoleDataQualityController).toSelf();
        this.container.bind<CasesController>(CasesController).toSelf();



        // Controllers
        this.container.bind<EmployeeController>(EmployeeController).toSelf();
        this.container.bind<FairnessController>(FairnessController).toSelf();
        this.container.bind<InterventionController>(InterventionController).toSelf();
        this.container.bind<PerformanceController>(PerformanceController).toSelf();
        this.container.bind<RecommendationController>(RecommendationController).toSelf();
        this.container.bind<DashboardController>(DashboardController).toSelf();
        this.container.bind<ConsoleBffController>(ConsoleBffController).toSelf();
        this.container.bind<TurnoverController>(TurnoverController).toSelf();
        this.container.bind<TrainingController>(TrainingController).toSelf();
        this.container.bind<ReportsController>(ReportsController).toSelf();
        this.container.bind<AlertsController>(AlertsController).toSelf();
        this.container.bind<UsersController>(UsersController).toSelf();
        this.container.bind<ImpactController>(ImpactController).toSelf();
        this.container.bind<MLController>(MLController).toSelf();
        this.container.bind<SalaryController>(SalaryController).toSelf();
        this.container.bind<AttendanceController>(AttendanceController).toSelf();
        this.container.bind<NotificationsController>(NotificationsController).toSelf();
        this.container.bind<GoalsController>(GoalsController).toSelf();
        this.container.bind<OrgObjectivesController>(OrgObjectivesController).toSelf();
        this.container.bind<ReviewTemplatesController>(ReviewTemplatesController).toSelf();
        this.container.bind<ReviewCyclesController>(ReviewCyclesController).toSelf();
        this.container.bind<ReviewsController>(ReviewsController).toSelf();
        this.container.bind<AnalyticsController>(AnalyticsController).toSelf();

        // Additional Services
        this.container.bind<TurnoverService>('TurnoverService').to(TurnoverService);
        this.container.bind<ProfileAggregatorService>('ProfileAggregatorService').to(ProfileAggregatorService);
        this.container.bind<DashboardService>(DashboardService).toSelf();

        // Example of Factory use (binding distinct from class)
        // this.container.bind<IEmployeeService>('FactoryEmployeeService').toDynamicValue((context) => {
        //     const db = context.container.get<DatabaseConnection>('DatabaseConnection');
        //     const ml = context.container.get<MLServiceClient>('MLServiceClient');
        //     return ServiceFactory.createEmployeeService(db, ml);
        // });
    }

    get<T>(identifier: any): T {
        return this.container.get<T>(identifier);
    }
}

