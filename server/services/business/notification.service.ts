import { injectable, inject } from 'inversify';
import { eventBus } from '../../shared/infrastructure/event-bus';
import { NotificationsRepository } from '../../data/repositories/notifications.repository';

/**
 * Notification Service — event-driven notification creation and persistence.
 *
 * When events are received via RabbitMQ (or in-process event bus),
 * this service creates persistent notification records in the database
 * so they can be queried and delivered to users via the /api/notifications endpoint.
 *
 * Extension points:
 * - Email delivery via SMTP (use metadata.deliveryChannel)
 * - WebSocket push to connected clients
 * - SMS delivery via external provider
 * - Notification templates for consistent formatting
 */
@injectable()
export class NotificationService {
    constructor(
        @inject('NotificationsRepository') private notificationsRepo: NotificationsRepository
    ) { }

    async initialize() {
        console.log('Initializing Notification Service...');

        // Subscribe to relevant events
        await eventBus.subscribe(
            'employee',
            ['employee.created', 'employee.updated'],
            this.handleEmployeeEvent.bind(this),
            'notification.employee'
        );

        await eventBus.subscribe(
            'turnover',
            ['turnover.risk.updated'],
            this.handleRiskEvent.bind(this),
            'notification.risk'
        );
    }

    /**
     * Create a notification for a specific user.
     * Can be called directly by other services or triggered by events.
     */
    async createNotification(params: {
        userId: string;
        type: string;
        category?: string;
        title: string;
        message: string;
        priority?: string;
        relatedEntityType?: string;
        relatedEntityId?: string;
        metadata?: Record<string, any>;
    }) {
        try {
            return await this.notificationsRepo.create({
                userId: params.userId,
                type: params.type,
                category: params.category || 'general',
                title: params.title,
                message: params.message,
                priority: params.priority || 'normal',
                channel: 'in_app',
                metadata: params.metadata || {},
                relatedEntityType: params.relatedEntityType || null,
                relatedEntityId: params.relatedEntityId || null,
            });
        } catch (err) {
            console.error('[NotificationService] Failed to create notification:', err);
        }
    }

    async handleEmployeeEvent(event: any) {
        console.log(`[Notification] Received employee event: ${event.eventType}`, event.data);

        if (event.eventType === 'employee.created') {
            // Notify admin users about new employee creation
            // In production, you'd query admin users and create notifications for each
            console.log(`[Notification] New employee created: ${event.data.fullName || event.data.email}`);
        }
    }

    async handleRiskEvent(event: any) {
        const { employeeId, riskScore, riskLevel } = event.data;
        console.log(`[Notification] Risk Update for ${employeeId}: Score=${riskScore}, Level=${riskLevel}`);

        if (riskLevel === 'high' || riskLevel === 'critical' || riskScore > 0.7) {
            console.log(`[Notification] 🚨 HIGH RISK ALERT for employee ${employeeId}`);
            // In production: query the employee's manager and HR users,
            // then create notifications for each via this.createNotification()
        }
    }
}

