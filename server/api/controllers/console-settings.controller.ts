import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPut, httpPost, httpDelete, httpPatch } from 'inversify-express-utils';
import { inject } from 'inversify';
import { ApiResponse } from '../../shared/api-response';
import { SettingsService } from '../../services/business/settings.service';
import { AuthService } from '../../services/business/auth.service';
import { IntegrationsRepository } from '../../data/repositories/integrations.repository';
import { SessionsRepository } from '../../data/repositories/sessions.repository';

@controller('/settings')
export class ConsoleSettingsController {
    constructor(
        @inject('SettingsService') private settingsService: SettingsService,
        @inject('AuthService') private authService: AuthService,
        @inject('IntegrationsRepository') private integrationsRepo: IntegrationsRepository,
        @inject('SessionsRepository') private sessionsRepo: SessionsRepository
    ) {}

    @httpGet('/')
    async getRoot(_req: Request, res: Response) {
        res.json(ApiResponse.success({ module: 'settings', version: 'v1' }));
    }

    // ── Organization Settings ──

    @httpGet('/organization')
    async getOrganizationSettings(req: Request, res: Response) {
        const settings = await this.settingsService.getOrganizationSettings();
        res.json(ApiResponse.success(settings));
    }

    @httpPut('/organization')
    async updateOrganizationSettings(req: Request, res: Response) {
        const settings = await this.settingsService.updateOrganizationSettings(req.body);
        res.json(ApiResponse.success(settings));
    }

    // ── Profile Settings ──

    @httpGet('/profile')
    async getProfileSettings(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const settings = await this.settingsService.getProfileSettings(userId);
        res.json(ApiResponse.success(settings));
    }

    @httpPut('/profile')
    async updateProfileSettings(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const settings = await this.settingsService.updateProfileSettings(userId, req.body);
        res.json(ApiResponse.success(settings));
    }

    // ── Notification Settings ──

    @httpGet('/notifications')
    async getNotificationSettings(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const settings = await this.settingsService.listNotifications(userId);
        res.json(ApiResponse.success(settings));
    }

    @httpPut('/notifications')
    async updateNotificationSettings(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const settings = await this.settingsService.updateNotificationSettings(userId, req.body);
        res.json(ApiResponse.success(settings));
    }

    // ── Security Settings ──

    @httpGet('/security/settings')
    async getSecuritySettings(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const settings = await this.settingsService.getSecuritySettings(userId);
        res.json(ApiResponse.success(settings));
    }

    @httpPut('/security/settings')
    async updateSecuritySettings(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const settings = await this.settingsService.updateSecuritySettings(userId, req.body);
        res.json(ApiResponse.success(settings));
    }

    // ── 2FA / MFA ──

    @httpGet('/security/2fa/status')
    async get2FAStatus(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const status = await this.authService.getMfaStatus(userId);
        res.json(ApiResponse.success(status));
    }

    @httpPost('/security/2fa/enable')
    async enable2FA(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const result = await this.authService.enableMfa(userId, req.body.method);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/security/2fa/disable')
    async disable2FA(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const result = await this.authService.disableMfa(userId);
        res.json(ApiResponse.success(result));
    }

    @httpPost('/security/2fa/verify')
    async verify2FA(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const result = await this.authService.verifyMfaToken(userId, req.body.token);
        res.json(ApiResponse.success(result));
    }

    // ── Password ──

    @httpPost('/security/password/change')
    async changePassword(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'currentPassword and newPassword required'));
        }
        const result = await this.authService.changePassword(userId, currentPassword, newPassword);
        res.json(ApiResponse.success(result));
    }

    // ── Session Management ──

    @httpGet('/security/sessions')
    async listSessions(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const sessions = await this.sessionsRepo.listUserSessions(userId);
        res.json(ApiResponse.success(sessions));
    }

    @httpPost('/security/sessions/:id/revoke')
    async revokeSession(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const sessionId = req.params.id;
        await this.settingsService.revokeSession(sessionId, userId);
        res.json(ApiResponse.success({ success: true }));
    }

    @httpDelete('/security/sessions/:id')
    async deleteSession(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const sessionId = req.params.id;
        await this.settingsService.revokeSession(sessionId, userId);
        res.json(ApiResponse.success({ success: true }));
    }

    // ── Legacy MFA endpoint ──

    @httpGet('/security/mfa')
    async getMfaStatus(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const status = await this.authService.getMfaStatus(userId);
        res.json(ApiResponse.success(status));
    }

    // ── Appearance Settings ──

    @httpGet('/appearance')
    async getAppearanceSettings(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const settings = await this.settingsService.getAppearanceSettings(userId);
        res.json(ApiResponse.success(settings));
    }

    @httpPut('/appearance')
    async updateAppearanceSettings(req: Request, res: Response) {
        const userId = (req as any).user.sub;
        const settings = await this.settingsService.updateAppearanceSettings(userId, req.body);
        res.json(ApiResponse.success(settings));
    }

    // ── Integrations ──

    @httpGet('/integrations')
    async listIntegrations(req: Request, res: Response) {
        const integrations = await this.integrationsRepo.listConnections();
        res.json(ApiResponse.success(integrations));
    }

    @httpGet('/integrations/:id')
    async getIntegration(req: Request, res: Response) {
        const id = req.params.id;
        const integration = await this.integrationsRepo.getConnection(id);
        if (!integration) return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Integration not found'));
        res.json(ApiResponse.success(integration));
    }

    @httpPost('/integrations/connect')
    async connectIntegration(req: Request, res: Response) {
        const { systemId, baseUrl, authType } = req.body;
        if (!systemId || !baseUrl || !authType) {
            return res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'systemId, baseUrl, authType required'));
        }
        const connection = await this.integrationsRepo.connect(systemId, baseUrl, authType);
        res.status(201).json(ApiResponse.success(connection, 'Connection attempt persisted'));
    }

    @httpPost('/integrations/:id/connect')
    async connectIntegrationById(req: Request, res: Response) {
        const id = req.params.id;
        const config = req.body || {};
        const connection = await this.integrationsRepo.connect(id, config.baseUrl || '', config.authType || 'api_key');
        res.status(201).json(ApiResponse.success(connection));
    }

    @httpPost('/integrations/:id/disconnect')
    async disconnectIntegration(req: Request, res: Response) {
        const id = req.params.id;
        const connection = await this.integrationsRepo.disconnect(id);
        if (!connection) return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Connection not found'));
        res.json(ApiResponse.success(connection, 'Disconnected'));
    }

    @httpPost('/integrations/:id/sync')
    async syncIntegration(req: Request, res: Response) {
        const id = req.params.id;
        const sync = await this.integrationsRepo.triggerSync(id);
        if (!sync) return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Connection not found'));
        res.json(ApiResponse.success(sync, 'Sync trigger persisted'));
    }

    @httpPost('/integrations/:id/reconnect')
    async reconnectIntegration(req: Request, res: Response) {
        const id = req.params.id;
        const connection = await this.integrationsRepo.reconnect(id);
        if (!connection) return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Connection not found'));
        res.json(ApiResponse.success(connection, 'Reconnect attempt persisted'));
    }

    @httpPut('/integrations/:id/config')
    async configureIntegration(req: Request, res: Response) {
        const id = req.params.id;
        const config = req.body;
        const connection = await this.integrationsRepo.updateConfig(id, config);
        if (!connection) return res.status(404).json(ApiResponse.error('NOT_FOUND', 'Connection not found'));
        res.json(ApiResponse.success(connection));
    }

    @httpPost('/integrations/:id/test')
    async testIntegrationConnection(req: Request, res: Response) {
        const id = req.params.id;
        const result = await this.integrationsRepo.testConnection(id);
        res.json(ApiResponse.success(result));
    }
}

// Top-level /integrations controller — canonical alias for /settings/integrations routes
@controller('/integrations')
export class IntegrationsController {
    constructor(
        @inject('IntegrationsRepository') private integrationsRepo: IntegrationsRepository
    ) {}

    @httpGet('/')
    async listIntegrations(_req: Request, res: Response) {
        const integrations = await this.integrationsRepo.listConnections();
        res.json(ApiResponse.success(integrations));
    }
}

