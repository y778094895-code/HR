// IntegrationsSettings Component
// Integrations management tab

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/overlays/use-toast';
import { useTranslation } from 'react-i18next';
import { useIntegrations } from '@/hooks/useIntegrations';
import { 
    Link2, RefreshCw, Loader2, AlertCircle, 
    CheckCircle2, XCircle, ExternalLink, Power
} from 'lucide-react';
import type { Integration, IntegrationStatus } from '@/types/integrations';

export const IntegrationsSettings: React.FC = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { integrations, isLoading, error, connect, disconnect, sync, reconnect, refresh } = useIntegrations();

    const [connectingId, setConnectingId] = useState<string | null>(null);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    const handleConnect = async (integrationId: string) => {
        setConnectingId(integrationId);
        try {
            await connect(integrationId);
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.integrations.connected', 'Integration connected successfully.'),
            });
        } catch (err) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.integrations.connectFailed', 'Failed to connect integration.'),
                variant: 'destructive',
            });
        } finally {
            setConnectingId(null);
        }
    };

    const handleDisconnect = async (integrationId: string) => {
        setConnectingId(integrationId);
        try {
            await disconnect(integrationId);
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.integrations.disconnected', 'Integration disconnected successfully.'),
            });
        } catch (err) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.integrations.disconnectFailed', 'Failed to disconnect integration.'),
                variant: 'destructive',
            });
        } finally {
            setConnectingId(null);
        }
    };

    const handleSync = async (integrationId: string) => {
        setSyncingId(integrationId);
        try {
            await sync(integrationId);
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.integrations.synced', 'Integration synced successfully.'),
            });
        } catch (err) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.integrations.syncFailed', 'Failed to sync integration.'),
                variant: 'destructive',
            });
        } finally {
            setSyncingId(null);
        }
    };

    const handleReconnect = async (integrationId: string) => {
        setConnectingId(integrationId);
        try {
            await reconnect(integrationId);
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.integrations.reconnected', 'Integration reconnected successfully.'),
            });
        } catch (err) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.integrations.reconnectFailed', 'Failed to reconnect integration.'),
                variant: 'destructive',
            });
        } finally {
            setConnectingId(null);
        }
    };

    const getStatusIcon = (status: IntegrationStatus) => {
        switch (status) {
            case 'connected':
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'pending':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'syncing':
                return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
            default:
                return <XCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: IntegrationStatus) => {
        switch (status) {
            case 'connected':
                return t('settings.integrations.status.connected', 'Connected');
            case 'error':
                return t('settings.integrations.status.error', 'Error');
            case 'pending':
                return t('settings.integrations.status.pending', 'Pending');
            case 'syncing':
                return t('settings.integrations.status.syncing', 'Syncing...');
            default:
                return t('settings.integrations.status.disconnected', 'Disconnected');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">{t('settings.integrations.available', 'Available Integrations')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t('settings.integrations.description', 'Connect your HR tools and services to sync data automatically.')}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={refresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('common.refresh', 'Refresh')}
                </Button>
            </div>

            {/* API Error Notice */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-800">{t('settings.integrations.apiError', 'Limited Integration Data')}</p>
                        <p className="text-sm text-yellow-700 mt-1">
                            {t('settings.integrations.apiErrorDesc', 'Integration status is showing defaults. Backend API integration required for live status.')}
                        </p>
                    </div>
                </div>
            )}

            {/* Integrations Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => (
                    <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        isLoading={connectingId === integration.id}
                        isSyncing={syncingId === integration.id}
                        onConnect={() => handleConnect(integration.id)}
                        onDisconnect={() => handleDisconnect(integration.id)}
                        onSync={() => handleSync(integration.id)}
                        onReconnect={() => handleReconnect(integration.id)}
                        getStatusIcon={getStatusIcon}
                        getStatusLabel={getStatusLabel}
                    />
                ))}
            </div>

            {/* Backend Limitation Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Link2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-blue-800">{t('settings.integrations.backendRequired', 'Backend Integration Required')}</p>
                    <p className="text-sm text-blue-700 mt-1">
                        {t('settings.integrations.backendRequiredDesc', 'For production, implement backend API endpoints at /api/integrations/* to enable live connection status, OAuth flows, and data synchronization.')}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Integration Card Component
interface IntegrationCardProps {
    integration: Integration;
    isLoading: boolean;
    isSyncing: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    onSync: () => void;
    onReconnect: () => void;
    getStatusIcon: (status: IntegrationStatus) => React.ReactNode;
    getStatusLabel: (status: IntegrationStatus) => string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
    integration,
    isLoading,
    isSyncing,
    onConnect,
    onDisconnect,
    onSync,
    onReconnect,
    getStatusIcon,
    getStatusLabel
}) => {
    const { t } = useTranslation();
    const isConnected = integration.status === 'connected';
    const hasError = integration.status === 'error';

    return (
        <div className={`
            p-4 border rounded-lg transition-all
            ${isConnected 
                ? 'bg-green-50/50 border-green-200' 
                : hasError 
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-card border-border hover:border-primary/50'}
        `}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold
                        ${isConnected ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}
                    `}>
                        {integration.name ? integration.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <h4 className="font-medium">{integration.name || 'Unknown Integration'}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {integration.description || 'No description available'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-3">
                {getStatusIcon(integration.status)}
                <span className={`
                    text-sm font-medium
                    ${isConnected ? 'text-green-700' : hasError ? 'text-red-700' : 'text-muted-foreground'}
                `}>
                    {getStatusLabel(integration.status)}
                </span>
                {integration.lastSyncAt && (
                    <span className="text-xs text-muted-foreground">
                        • {t('settings.integrations.lastSync', 'Last sync: {{time}}', { 
                            time: new Date(integration.lastSyncAt).toLocaleDateString() 
                        })}
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {isConnected ? (
                    <>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onSync}
                            disabled={isSyncing}
                            className="flex-1"
                        >
                            {isSyncing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    {t('settings.integrations.sync', 'Sync')}
                                </>
                            )}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onDisconnect}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Power className="h-4 w-4" />
                            )}
                        </Button>
                    </>
                ) : hasError ? (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onReconnect}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {t('settings.integrations.reconnect', 'Reconnect')}
                            </>
                        )}
                    </Button>
                ) : (
                    <Button 
                        size="sm" 
                        onClick={onConnect}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Link2 className="h-4 w-4 mr-2" />
                                {t('settings.integrations.connect', 'Connect')}
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};

