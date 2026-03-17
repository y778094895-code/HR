// SecuritySettings Component
// Security, 2FA, password, and session management

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { useToast } from '@/components/ui/overlays/use-toast';
import { useTranslation } from 'react-i18next';
import { useSecuritySettings, use2FAStatus, useActiveSessions, usePasswordChange } from '@/hooks/useSettings';
import {
    Shield, Lock, Key, Smartphone, Monitor,
    Save, Loader2, AlertCircle, CheckCircle2,
    LogOut, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { Switch } from '@/components/ui/buttons/switch';
import { useAuth } from '@/contexts/AuthContext';

interface SecuritySettingsProps {
    showSessions?: boolean;
    showPolicy?: boolean;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ showSessions = false, showPolicy = false }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const { changePassword, isLoading: isChangingPassword } = usePasswordChange();

    // 2FA state
    const { isEnabled: is2FAEnabled, method: twoFAMethod, isLoading: is2FALoading, enable: enable2FA, disable: disable2FA, refresh: refresh2FA } = use2FAStatus();
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [selected2FAMethod, setSelected2FAMethod] = useState<'totp' | 'sms' | 'email'>('totp');

    // Security settings
    const { data: securitySettings, isLoading: isSecurityLoading, save: saveSecuritySettings } = useSecuritySettings();
    const [passwordPolicy, setPasswordPolicy] = useState({
        require12Chars: true,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        enforce90Days: false,
        preventReuse: 5
    });
    const [sessionTimeout, setSessionTimeout] = useState(30);

    // Sessions
    const { sessions, isLoading: isSessionsLoading, terminate, refresh: refreshSessions } = useActiveSessions();

    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Update state when data loads
    useEffect(() => {
        if (securitySettings) {
            if (securitySettings.passwordPolicy) {
                setPasswordPolicy(prev => ({ ...prev, ...securitySettings.passwordPolicy }));
            }
            if (securitySettings.sessionTimeout) {
                setSessionTimeout(securitySettings.sessionTimeout);
            }
        }
    }, [securitySettings]);

    // Password change handlers
    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.security.passwordMismatch', 'New passwords do not match.'),
                variant: 'destructive',
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.security.passwordTooShort', 'Password must be at least 8 characters.'),
                variant: 'destructive',
            });
            return;
        }

        const success = await changePassword(currentPassword, newPassword);
        if (success) {
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.security.passwordChanged', 'Password changed successfully.'),
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.security.passwordChangeFailed', 'Failed to change password. Please check your current password.'),
                variant: 'destructive',
            });
        }
    };

    // 2FA handlers
    const handleEnable2FA = async () => {
        try {
            await enable2FA(selected2FAMethod);
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.security.2faEnabled', 'Two-factor authentication enabled successfully.'),
            });
            setShow2FASetup(false);
        } catch (error) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.security.2faEnableFailed', 'Failed to enable two-factor authentication.'),
                variant: 'destructive',
            });
        }
    };

    const handleDisable2FA = async () => {
        try {
            await disable2FA();
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.security.2faDisabled', 'Two-factor authentication disabled.'),
            });
        } catch (error) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.security.2faDisableFailed', 'Failed to disable two-factor authentication.'),
                variant: 'destructive',
            });
        }
    };

    // Security policy handlers
    const handlePolicyToggle = (key: 'require12Chars' | 'requireSpecialChars' | 'requireNumbers' | 'requireUppercase' | 'enforce90Days') => {
        setPasswordPolicy(prev => ({ ...prev, [key]: !prev[key] }));
        setIsDirty(true);
    };

    const handleSavePolicy = async () => {
        setIsSaving(true);
        try {
            await saveSecuritySettings({ passwordPolicy, sessionTimeout });
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.security.policySaved', 'Security policy updated successfully.'),
            });
            setIsDirty(false);
        } catch (error) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.security.policyError', 'Failed to update security policy.'),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Session handlers
    const handleTerminateSession = async (sessionId: string) => {
        try {
            await terminate(sessionId);
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.security.sessionTerminated', 'Session terminated successfully.'),
            });
        } catch (error) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.security.sessionTerminateFailed', 'Failed to terminate session.'),
                variant: 'destructive',
            });
        }
    };

    // Render content based on props
    if (showSessions) {
        return <SessionsTab
            sessions={sessions}
            isLoading={isSessionsLoading}
            onTerminate={handleTerminateSession}
            onRefresh={refreshSessions}
        />;
    }

    if (showPolicy) {
        return (
            <PolicyTab
                passwordPolicy={passwordPolicy}
                sessionTimeout={sessionTimeout}
                isSaving={isSaving}
                isDirty={isDirty}
                onToggle={handlePolicyToggle}
                onSessionTimeoutChange={(val) => { setSessionTimeout(val); setIsDirty(true); }}
                onSave={handleSavePolicy}
            />
        );
    }

    // Default: Password and 2FA
    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Password Change */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.security.password', 'Change Password')}</h3>
                </div>

                <div className="grid gap-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">{t('settings.security.currentPassword', 'Current Password')}</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showPasswords ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder={t('settings.security.currentPasswordPlaceholder', 'Enter current password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">{t('settings.security.newPassword', 'New Password')}</Label>
                        <Input
                            id="newPassword"
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t('settings.security.newPasswordPlaceholder', 'Enter new password')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('settings.security.confirmPassword', 'Confirm New Password')}</Label>
                        <Input
                            id="confirmPassword"
                            type={showPasswords ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t('settings.security.confirmPasswordPlaceholder', 'Confirm new password')}
                        />
                    </div>

                    <Button
                        onClick={handlePasswordChange}
                        disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                    >
                        {isChangingPassword ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Key className="h-4 w-4 mr-2" />
                                {t('settings.security.changePassword', 'Change Password')}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* 2FA Section */}
            <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.security.twoFactor', 'Two-Factor Authentication')}</h3>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {is2FAEnabled ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            )}
                            <div>
                                <p className="font-medium">
                                    {is2FAEnabled
                                        ? t('settings.security.2faEnabled', '2FA is enabled')
                                        : t('settings.security.2faDisabled', '2FA is not enabled')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {is2FAEnabled && twoFAMethod
                                        ? t('settings.security.2faMethod', 'Method: {{method}}', { method: twoFAMethod.toUpperCase() })
                                        : t('settings.security.2faDesc', 'Add an extra layer of security to your account')}
                                </p>
                            </div>
                        </div>

                        {is2FAEnabled ? (
                            <Button
                                variant="outline"
                                onClick={handleDisable2FA}
                                disabled={is2FALoading}
                            >
                                {is2FALoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    t('settings.security.disable2fa', 'Disable')
                                )}
                            </Button>
                        ) : show2FASetup ? (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShow2FASetup(false)}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    onClick={handleEnable2FA}
                                    disabled={is2FALoading}
                                >
                                    {is2FALoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        t('settings.security.enable2fa', 'Enable')
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setShow2FASetup(true)}
                            >
                                <Smartphone className="h-4 w-4 mr-2" />
                                {t('settings.security.setup2fa', 'Setup 2FA')}
                            </Button>
                        )}
                    </div>

                    {/* 2FA Setup Options */}
                    {show2FASetup && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-3">
                                {t('settings.security.selectMethod', 'Select authentication method:')}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant={selected2FAMethod === 'totp' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelected2FAMethod('totp')}
                                >
                                    <Key className="h-4 w-4 mr-2" />
                                    Authenticator App
                                </Button>
                                <Button
                                    variant={selected2FAMethod === 'sms' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelected2FAMethod('sms')}
                                >
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    SMS
                                </Button>
                                <Button
                                    variant={selected2FAMethod === 'email' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelected2FAMethod('email')}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Email
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {!is2FAEnabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-800">{t('settings.security.recommend2fa', 'We recommend enabling 2FA')}</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    {t('settings.security.recommend2faDesc', 'Two-factor authentication adds an extra layer of security by requiring a verification code in addition to your password.')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Backend Limitation Notice */}
            <div className="border-t pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-800">{t('settings.security.backendLimited', 'Backend Limited')}</p>
                        <p className="text-sm text-yellow-700 mt-1">
                            {t('settings.security.backendLimitedDesc', 'Password and 2FA features are currently using local storage. For production, implement backend API endpoints at /api/security/*')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sessions Tab Component
interface SessionsTabProps {
    sessions: Array<{
        id: string;
        device: string;
        ipAddress: string;
        location: string;
        lastActive: string;
        current: boolean;
    }>;
    isLoading: boolean;
    onTerminate: (sessionId: string) => void;
    onRefresh: () => void;
}

const SessionsTab: React.FC<SessionsTabProps> = ({ sessions, isLoading, onTerminate, onRefresh }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t('settings.security.activeSessions', 'Active Sessions')}</h3>
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t('common.refresh', 'Refresh')}
                    </Button>
                </div>
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                    <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">{t('settings.security.noSessions', 'No active sessions')}</p>
                    <p className="text-sm mt-2">{t('settings.security.noSessionsDesc', 'You are not currently logged in on any other devices.')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('settings.security.activeSessions', 'Active Sessions')}</h3>
                <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('common.refresh', 'Refresh')}
                </Button>
            </div>

            <div className="space-y-3">
                {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                            <Monitor className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{session.device}</p>
                                    {session.current && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                            {t('settings.security.current', 'Current')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {session.ipAddress} • {session.location}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t('settings.security.lastActive', 'Last active: {{time}}', { time: new Date(session.lastActive).toLocaleString() })}
                                </p>
                            </div>
                        </div>
                        {!session.current && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onTerminate(session.id)}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                {t('settings.security.terminate', 'Terminate')}
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Policy Tab Component
interface PolicyTabProps {
    passwordPolicy: {
        require12Chars: boolean;
        requireSpecialChars: boolean;
        requireNumbers: boolean;
        requireUppercase: boolean;
        enforce90Days: boolean;
        preventReuse: number;
    };
    sessionTimeout: number;
    isSaving: boolean;
    isDirty: boolean;
    onToggle: (key: 'require12Chars' | 'requireSpecialChars' | 'requireNumbers' | 'requireUppercase' | 'enforce90Days') => void;
    onSessionTimeoutChange: (value: number) => void;
    onSave: () => void;
}

const PolicyTab: React.FC<PolicyTabProps> = ({
    passwordPolicy,
    sessionTimeout,
    isSaving,
    isDirty,
    onToggle,
    onSessionTimeoutChange,
    onSave
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Password Policy */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.security.passwordPolicy', 'Password Policy')}</h3>
                </div>

                <div className="space-y-3">
                    <PolicyOption
                        title={t('settings.security.require12Chars', 'Minimum 12 characters')}
                        checked={passwordPolicy.require12Chars}
                        onChange={() => onToggle('require12Chars')}
                    />
                    <PolicyOption
                        title={t('settings.security.requireSpecialChars', 'Require special characters')}
                        checked={passwordPolicy.requireSpecialChars}
                        onChange={() => onToggle('requireSpecialChars')}
                    />
                    <PolicyOption
                        title={t('settings.security.requireNumbers', 'Require numbers')}
                        checked={passwordPolicy.requireNumbers}
                        onChange={() => onToggle('requireNumbers')}
                    />
                    <PolicyOption
                        title={t('settings.security.requireUppercase', 'Require uppercase letters')}
                        checked={passwordPolicy.requireUppercase}
                        onChange={() => onToggle('requireUppercase')}
                    />
                    <PolicyOption
                        title={t('settings.security.enforce90Days', 'Enforce 90-day password rotation')}
                        checked={passwordPolicy.enforce90Days}
                        onChange={() => onToggle('enforce90Days')}
                    />
                </div>
            </div>

            {/* Session Settings */}
            <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.security.sessionSettings', 'Session Settings')}</h3>
                </div>

                <div className="max-w-md">
                    <Label htmlFor="sessionTimeout">{t('settings.security.sessionTimeout', 'Session Timeout (minutes)')}</Label>
                    <select
                        id="sessionTimeout"
                        className="w-full p-2 mt-1 border rounded-md bg-background"
                        value={sessionTimeout}
                        onChange={(e) => onSessionTimeoutChange(Number(e.target.value))}
                    >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={480}>8 hours</option>
                    </select>
                </div>
            </div>

            {/* Save Button */}
            <div className="border-t pt-6 flex justify-end">
                <Button
                    onClick={onSave}
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

// Policy Option Component
interface PolicyOptionProps {
    title: string;
    checked: boolean;
    onChange: () => void;
}

const PolicyOption: React.FC<PolicyOptionProps> = ({ title, checked, onChange }) => {
    return (
        <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
            <Switch checked={checked} onCheckedChange={onChange} />
            <span>{title}</span>
        </label>
    );
};

