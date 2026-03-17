// NotificationSettings Component
// Notification preferences tab - email, in-app, SMS

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/overlays/use-toast';
import { useTranslation } from 'react-i18next';
import { useNotificationSettings } from '@/hooks/useSettings';
import { 
    Bell, Mail, Smartphone, Globe, Save, Loader2, 
    AlertCircle, CheckCircle2 
} from 'lucide-react';
import { Switch } from '@/components/ui/buttons/switch';

interface NotificationSettingsProps {
    type: 'email' | 'inApp' | 'sms';
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ type }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { data: notifSettings, isLoading, error, save } = useNotificationSettings();

    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Local state for notifications
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState({
        newHires: true,
        attritionAlerts: true,
        performanceReviews: true,
        weeklyReports: false
    });

    const [inAppEnabled, setInAppEnabled] = useState(true);
    const [inAppNotifications, setInAppNotifications] = useState({
        realTimeAlerts: true,
        dailyDigest: true,
        weeklySummary: false
    });

    const [smsEnabled, setSmsEnabled] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState({
        urgentAlerts: false,
        dailySummary: false
    });

    // Update local state when data loads
    useEffect(() => {
        if (notifSettings) {
            if (typeof notifSettings.emailEnabled === 'boolean') setEmailEnabled(notifSettings.emailEnabled);
            if (notifSettings.emailNotifications) {
                setEmailNotifications(prev => ({ 
                    ...prev, 
                    ...notifSettings.emailNotifications,
                    newHires: notifSettings.emailNotifications.newHires ?? prev.newHires,
                    attritionAlerts: notifSettings.emailNotifications.attritionAlerts ?? prev.attritionAlerts,
                    performanceReviews: notifSettings.emailNotifications.performanceReviews ?? prev.performanceReviews,
                    weeklyReports: notifSettings.emailNotifications.weeklyReports ?? prev.weeklyReports,
                }));
            }
            
            if (typeof notifSettings.inAppEnabled === 'boolean') setInAppEnabled(notifSettings.inAppEnabled);
            if (notifSettings.inAppNotifications) {
                setInAppNotifications(prev => ({ 
                    ...prev, 
                    ...notifSettings.inAppNotifications,
                    realTimeAlerts: notifSettings.inAppNotifications.realTimeAlerts ?? prev.realTimeAlerts,
                    dailyDigest: notifSettings.inAppNotifications.dailyDigest ?? prev.dailyDigest,
                    weeklySummary: notifSettings.inAppNotifications.weeklySummary ?? prev.weeklySummary,
                }));
            }
            
            if (typeof notifSettings.smsEnabled === 'boolean') setSmsEnabled(notifSettings.smsEnabled);
            if (notifSettings.smsNotifications) {
                setSmsNotifications(prev => ({ 
                    ...prev, 
                    ...notifSettings.smsNotifications,
                    urgentAlerts: notifSettings.smsNotifications.urgentAlerts ?? prev.urgentAlerts,
                    dailySummary: notifSettings.smsNotifications.dailySummary ?? prev.dailySummary,
                }));
            }
        }
    }, [notifSettings]);

    const handleEmailToggle = (key: keyof typeof emailNotifications) => {
        setEmailNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        setIsDirty(true);
    };

    const handleInAppToggle = (key: keyof typeof inAppNotifications) => {
        setInAppNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        setIsDirty(true);
    };

    const handleSmsToggle = (key: keyof typeof smsNotifications) => {
        setSmsNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        setIsDirty(true);
    };

    const handleMasterToggle = (channel: 'email' | 'inApp' | 'sms') => {
        switch (channel) {
            case 'email':
                setEmailEnabled(!emailEnabled);
                break;
            case 'inApp':
                setInAppEnabled(!inAppEnabled);
                break;
            case 'sms':
                setSmsEnabled(!smsEnabled);
                break;
        }
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData = {
                emailEnabled,
                emailNotifications,
                inAppEnabled,
                inAppNotifications,
                smsEnabled,
                smsNotifications
            };
            await save(updateData);
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.notifications.saved', 'Notification preferences updated successfully.'),
            });
            setIsDirty(false);
        } catch (error) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.notifications.error', 'Failed to update notification preferences.'),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Render based on type
    const renderContent = () => {
        switch (type) {
            case 'email':
                return (
                    <div className="space-y-6">
                        {/* Master Toggle */}
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">{t('settings.notifications.email.enabled', 'Email Notifications')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.notifications.email.enabledDesc', 'Receive notifications via email')}
                                    </p>
                                </div>
                            </div>
                            <Switch 
                                checked={emailEnabled}
                                onCheckedChange={() => handleMasterToggle('email')}
                            />
                        </div>

                        {/* Notification Options */}
                        {emailEnabled && (
                            <div className="space-y-4">
                                <NotificationOption
                                    title={t('settings.notifications.newHires', 'New Hires')}
                                    description={t('settings.notifications.newHiresDesc', 'Get notified about new employee hires')}
                                    checked={emailNotifications.newHires}
                                    onChange={() => handleEmailToggle('newHires')}
                                />
                                <NotificationOption
                                    title={t('settings.notifications.attritionAlerts', 'Attrition Alerts')}
                                    description={t('settings.notifications.attritionAlertsDesc', 'Get notified about employee attrition risk')}
                                    checked={emailNotifications.attritionAlerts}
                                    onChange={() => handleEmailToggle('attritionAlerts')}
                                />
                                <NotificationOption
                                    title={t('settings.notifications.performanceReviews', 'Performance Reviews')}
                                    description={t('settings.notifications.performanceReviewsDesc', 'Notifications about performance review cycles')}
                                    checked={emailNotifications.performanceReviews}
                                    onChange={() => handleEmailToggle('performanceReviews')}
                                />
                                <NotificationOption
                                    title={t('settings.notifications.weeklyReports', 'Weekly Reports')}
                                    description={t('settings.notifications.weeklyReportsDesc', 'Receive weekly analytics reports')}
                                    checked={emailNotifications.weeklyReports}
                                    onChange={() => handleEmailToggle('weeklyReports')}
                                />
                            </div>
                        )}
                    </div>
                );

            case 'inApp':
                return (
                    <div className="space-y-6">
                        {/* Master Toggle */}
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">{t('settings.notifications.inApp.enabled', 'In-App Notifications')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.notifications.inApp.enabledDesc', 'Receive notifications within the application')}
                                    </p>
                                </div>
                            </div>
                            <Switch 
                                checked={inAppEnabled}
                                onCheckedChange={() => handleMasterToggle('inApp')}
                            />
                        </div>

                        {/* Notification Options */}
                        {inAppEnabled && (
                            <div className="space-y-4">
                                <NotificationOption
                                    title={t('settings.notifications.realTimeAlerts', 'Real-Time Alerts')}
                                    description={t('settings.notifications.realTimeAlertsDesc', 'Get instant notifications for critical events')}
                                    checked={inAppNotifications.realTimeAlerts}
                                    onChange={() => handleInAppToggle('realTimeAlerts')}
                                />
                                <NotificationOption
                                    title={t('settings.notifications.dailyDigest', 'Daily Digest')}
                                    description={t('settings.notifications.dailyDigestDesc', 'Receive a daily summary of activities')}
                                    checked={inAppNotifications.dailyDigest}
                                    onChange={() => handleInAppToggle('dailyDigest')}
                                />
                                <NotificationOption
                                    title={t('settings.notifications.weeklySummary', 'Weekly Summary')}
                                    description={t('settings.notifications.weeklySummaryDesc', 'Receive a weekly analytics summary')}
                                    checked={inAppNotifications.weeklySummary}
                                    onChange={() => handleInAppToggle('weeklySummary')}
                                />
                            </div>
                        )}
                    </div>
                );

            case 'sms':
                return (
                    <div className="space-y-6">
                        {/* Master Toggle */}
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">{t('settings.notifications.sms.enabled', 'SMS Notifications')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.notifications.sms.enabledDesc', 'Receive urgent notifications via SMS')}
                                    </p>
                                </div>
                            </div>
                            <Switch 
                                checked={smsEnabled}
                                onCheckedChange={() => handleMasterToggle('sms')}
                            />
                        </div>

                        {/* Notification Options */}
                        {smsEnabled && (
                            <div className="space-y-4">
                                <NotificationOption
                                    title={t('settings.notifications.urgentAlerts', 'Urgent Alerts')}
                                    description={t('settings.notifications.urgentAlertsDesc', 'Critical alerts that require immediate attention')}
                                    checked={smsNotifications.urgentAlerts}
                                    onChange={() => handleSmsToggle('urgentAlerts')}
                                />
                            </div>
                        )}

                        {!smsEnabled && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-yellow-800">{t('settings.notifications.sms.note', 'Note')}</p>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            {t('settings.notifications.sms.noteDesc', 'SMS notifications may incur additional charges. Contact your administrator to enable this feature.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* API Error Notice */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-800">{t('settings.notifications.apiError', 'Using local defaults')}</p>
                        <p className="text-sm text-yellow-700 mt-1">
                            {t('settings.notifications.apiErrorDesc', 'Notification settings are currently using local defaults.')}
                        </p>
                    </div>
                </div>
            )}

            {renderContent()}

            {/* Save Button */}
            <div className="border-t pt-6 flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={!isDirty || isSaving}
                    className="min-w-[120px]"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {t('common.save', 'Save')}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

// Notification Option Component
interface NotificationOptionProps {
    title: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}

const NotificationOption: React.FC<NotificationOptionProps> = ({
    title,
    description,
    checked,
    onChange
}) => {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
            <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
};

