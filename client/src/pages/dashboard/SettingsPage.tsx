import React, { useState } from 'react';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { 
    Globe, Layers, Shield, Users, Lock, 
    Bell, Palette, Link2, User, Building2,
    AlertTriangle, Database, Mail
} from 'lucide-react';

// Import settings tab components
import { GeneralSettings } from '@/components/features/settings/tabs/GeneralSettings';
import { OrganizationSettings } from '@/components/features/settings/tabs/OrganizationSettings';
import { NotificationSettings } from '@/components/features/settings/tabs/NotificationSettings';
import { SecuritySettings } from '@/components/features/settings/tabs/SecuritySettings';
import { IntegrationsSettings } from '@/components/features/settings/tabs/IntegrationsSettings';

export default function SettingsPage() {
    const { hasRole } = useAuth();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'account';

    const getTitle = () => {
        switch (view) {
            case 'account':
                return t('settings.account.title', 'Account Settings');
            case 'organization':
                return t('settings.organization.title', 'Organization Settings');
            case 'notifications':
                return t('settings.notifications.title', 'Notification Preferences');
            case 'security':
                return t('settings.security.title', 'Security & Privacy');
            case 'integrations':
                return t('settings.integrations.title', 'Integrations');
            default:
                return t('settings.title', 'Settings');
        }
    };

    const renderTabs = (): TabItem[] => {
        // Account Settings (default view)
        if (view === 'account' || !view) {
            return [
                {
                    value: 'profile',
                    label: t('settings.tabs.profile', 'Profile'),
                    content: (
                        <div className="mt-6">
                            <GeneralSettings />
                        </div>
                    )
                },
                {
                    value: 'appearance',
                    label: t('settings.tabs.appearance', 'Appearance'),
                    content: (
                        <div className="mt-6">
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                {t('settings.appearance.comingSoon', 'Appearance settings are managed from the Organization tab')}
                            </div>
                        </div>
                    )
                }
            ];
        }

        // Organization Settings
        if (view === 'organization') {
            return [
                {
                    value: 'general',
                    label: t('settings.tabs.general', 'General'),
                    content: (
                        <div className="mt-6">
                            <OrganizationSettings />
                        </div>
                    )
                },
                {
                    value: 'departments',
                    label: t('settings.tabs.departments', 'Departments'),
                    content: (
                        <div className="mt-6">
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">{t('settings.departments.unavailable', 'Department Management')}</p>
                                <p className="text-sm mt-2">{t('settings.departments.unavailableDesc', 'Contact your administrator to manage departments.')}</p>
                            </div>
                        </div>
                    )
                },
                {
                    value: 'locations',
                    label: t('settings.tabs.locations', 'Locations'),
                    content: (
                        <div className="mt-6">
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">{t('settings.locations.unavailable', 'Location Management')}</p>
                                <p className="text-sm mt-2">{t('settings.locations.unavailableDesc', 'Contact your administrator to manage locations.')}</p>
                            </div>
                        </div>
                    )
                }
            ];
        }

        // Notification Settings
        if (view === 'notifications') {
            return [
                {
                    value: 'email',
                    label: t('settings.tabs.email', 'Email'),
                    content: (
                        <div className="mt-6">
                            <NotificationSettings type="email" />
                        </div>
                    )
                },
                {
                    value: 'in-app',
                    label: t('settings.tabs.inApp', 'In-App'),
                    content: (
                        <div className="mt-6">
                            <NotificationSettings type="inApp" />
                        </div>
                    )
                },
                {
                    value: 'sms',
                    label: t('settings.tabs.sms', 'SMS'),
                    content: (
                        <div className="mt-6">
                            <NotificationSettings type="sms" />
                        </div>
                    )
                }
            ];
        }

        // Security Settings
        if (view === 'security') {
            if (!hasRole(['admin', 'manager'])) {
                return [
                    {
                        value: 'password',
                        label: t('settings.tabs.password', 'Password'),
                        content: (
                            <div className="mt-6">
                                <SecuritySettings />
                            </div>
                        )
                    },
                    {
                        value: 'sessions',
                        label: t('settings.tabs.sessions', 'Active Sessions'),
                        content: (
                            <div className="mt-6">
                                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-medium">{t('settings.sessions.unavailable', 'Session Management')}</p>
                                    <p className="text-sm mt-2">{t('settings.sessions.unavailableDesc', 'Contact your administrator to view active sessions.')}</p>
                                </div>
                            </div>
                        )
                    }
                ];
            }

            return [
                {
                    value: 'password',
                    label: t('settings.tabs.password', 'Password'),
                    content: (
                        <div className="mt-6">
                            <SecuritySettings />
                        </div>
                    )
                },
                {
                    value: 'sessions',
                    label: t('settings.tabs.sessions', 'Active Sessions'),
                    content: (
                        <div className="mt-6">
                            <SecuritySettings showSessions />
                        </div>
                    )
                },
                {
                    value: 'policy',
                    label: t('settings.tabs.policy', 'Security Policy'),
                    content: (
                        <div className="mt-6">
                            <SecuritySettings showPolicy />
                        </div>
                    )
                }
            ];
        }

        // Integrations
        if (view === 'integrations') {
            return [
                {
                    value: 'available',
                    label: t('settings.tabs.available', 'Available'),
                    content: (
                        <div className="mt-6">
                            <IntegrationsSettings />
                        </div>
                    )
                }
            ];
        }

        // Fallback for unknown views - redirect to account
        return [
            {
                value: 'profile',
                label: t('settings.tabs.profile', 'Profile'),
                content: (
                    <div className="mt-6">
                        <GeneralSettings />
                    </div>
                )
            }
        ];
    };

    // Get icon for current view
    const getIcon = () => {
        switch (view) {
            case 'account':
                return <User className="h-5 w-5" />;
            case 'organization':
                return <Building2 className="h-5 w-5" />;
            case 'notifications':
                return <Bell className="h-5 w-5" />;
            case 'security':
                return <Shield className="h-5 w-5" />;
            case 'integrations':
                return <Link2 className="h-5 w-5" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    // Navigation items for settings sidebar
    const navigationItems = [
        {
            id: 'account',
            label: t('settings.nav.account', 'Account'),
            icon: <User className="h-4 w-4" />,
            description: t('settings.nav.accountDesc', 'Profile and preferences')
        },
        {
            id: 'organization',
            label: t('settings.nav.organization', 'Organization'),
            icon: <Building2 className="h-4 w-4" />,
            description: t('settings.nav.organizationDesc', 'Company and workspace settings')
        },
        {
            id: 'notifications',
            label: t('settings.nav.notifications', 'Notifications'),
            icon: <Bell className="h-4 w-4" />,
            description: t('settings.nav.notificationsDesc', 'Email, in-app, and SMS preferences')
        },
        {
            id: 'security',
            label: t('settings.nav.security', 'Security'),
            icon: <Shield className="h-4 w-4" />,
            description: t('settings.nav.securityDesc', 'Password, 2FA, and sessions')
        },
        {
            id: 'integrations',
            label: t('settings.nav.integrations', 'Integrations'),
            icon: <Link2 className="h-4 w-4" />,
            description: t('settings.nav.integrationsDesc', 'Connected services and APIs')
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        {getIcon()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{getTitle()}</h1>
                        <p className="text-muted-foreground">
                            {t('settings.description', 'Manage your account, organization, and system preferences.')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Settings Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {navigationItems.map((item) => {
                    const isActive = view === item.id;
                    return (
                        <a
                            key={item.id}
                            href={`?view=${item.id}`}
                            className={`
                                flex flex-col items-start p-4 rounded-lg border transition-all
                                ${isActive 
                                    ? 'bg-primary/5 border-primary shadow-sm' 
                                    : 'bg-card hover:bg-muted/50 border-border'}
                            `}
                        >
                            <div className={`${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {item.icon}
                            </div>
                            <span className={`font-medium mt-2 ${isActive ? 'text-primary' : ''}`}>
                                {item.label}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                                {item.description}
                            </span>
                        </a>
                    );
                })}
            </div>

            <TabsContainer
                tabs={renderTabs()}
                syncWithUrl="tab"
            />
        </div>
    );
}

