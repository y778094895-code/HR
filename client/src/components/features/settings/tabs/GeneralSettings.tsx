// GeneralSettings Component
// Profile and account settings tab

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { useToast } from '@/components/ui/overlays/use-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useAppearance, ThemeType, AccentType } from '@/contexts/AppearanceContext';
import { User, Mail, Building2, Palette, Save, Loader2 } from 'lucide-react';

export const GeneralSettings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const { user } = useAuth();
    const { theme, setTheme, accent, setAccent } = useAppearance();

    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        username: user?.username || '',
        department: user?.department || '',
        language: i18n.language || 'ar'
    });

    // Update form when user changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || prev.fullName,
                email: user.email || prev.email,
                username: user.username || prev.username,
                department: user.department || prev.department
            }));
        }
    }, [user]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleLanguageChange = (language: string) => {
        setFormData(prev => ({ ...prev, language }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Apply language change
            if (formData.language !== i18n.language) {
                i18n.changeLanguage(formData.language);
                localStorage.setItem('app_lang', formData.language);
                document.documentElement.dir = formData.language === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = formData.language;
            }

            // Note: In production, this would call an API to update user profile
            // For now, we persist locally
            localStorage.setItem('user_profile', JSON.stringify(formData));

            toast({
                title: t('common.success', 'Success'),
                description: t('settings.profile.saved', 'Profile updated successfully.'),
            });
            setIsDirty(false);
        } catch (error) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.profile.error', 'Failed to update profile.'),
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Theme options
    const themes: { id: ThemeType; label: string }[] = [
        { id: 'light', label: t('settings.theme.light', 'Light') },
        { id: 'dark', label: t('settings.theme.dark', 'Dark') },
        { id: 'midnight', label: t('settings.theme.midnight', 'Midnight') },
        { id: 'sand', label: t('settings.theme.sand', 'Sand') },
        { id: 'system', label: t('settings.theme.system', 'System') }
    ];

    const accents: { id: AccentType; colorClass: string; label: string }[] = [
        { id: 'default', colorClass: 'bg-zinc-900 dark:bg-zinc-50', label: t('settings.accent.default', 'Default') },
        { id: 'blue', colorClass: 'bg-blue-600', label: t('settings.accent.blue', 'Blue') },
        { id: 'green', colorClass: 'bg-green-600', label: t('settings.accent.green', 'Green') },
        { id: 'purple', colorClass: 'bg-purple-600', label: t('settings.accent.purple', 'Purple') },
        { id: 'orange', colorClass: 'bg-orange-600', label: t('settings.accent.orange', 'Orange') }
    ];

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Profile Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.profile.title', 'Profile Information')}</h3>
                </div>
                
                <div className="grid gap-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">{t('settings.profile.fullName', 'Full Name')}</Label>
                        <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            placeholder={t('settings.profile.fullNamePlaceholder', 'Enter your full name')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">{t('settings.profile.email', 'Email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder={t('settings.profile.emailPlaceholder', 'Enter your email')}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('settings.profile.emailChange', 'Contact administrator to change email.')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">{t('settings.profile.username', 'Username')}</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            placeholder={t('settings.profile.usernamePlaceholder', 'Enter your username')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">{t('settings.profile.department', 'Department')}</Label>
                        <Input
                            id="department"
                            value={formData.department}
                            onChange={(e) => handleChange('department', e.target.value)}
                            placeholder={t('settings.profile.departmentPlaceholder', 'Enter your department')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="language">{t('settings.profile.language', 'Language')}</Label>
                        <select
                            id="language"
                            className="w-full p-2 border rounded-md bg-background"
                            value={formData.language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                            <option value="ar">{t('settings.profile.arabic', 'العربية (Arabic)')}</option>
                            <option value="en">{t('settings.profile.english', 'English')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.appearance.title', 'Appearance')}</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('settings.appearance.theme', 'Theme')}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2" role="radiogroup" aria-label="Theme preference">
                            {themes.map((themeOption) => (
                                <button
                                    key={themeOption.id}
                                    role="radio"
                                    aria-checked={theme === themeOption.id}
                                    onClick={() => {
                                        setTheme(themeOption.id);
                                        setIsDirty(true);
                                    }}
                                    className={`
                                        flex items-center justify-center p-3 rounded-lg border-2 transition-all
                                        ${theme === themeOption.id 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-border hover:border-primary/50'}
                                    `}
                                >
                                    <span className={`text-sm font-medium ${theme === themeOption.id ? 'text-primary' : ''}`}>
                                        {themeOption.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('settings.appearance.accent', 'Accent Color')}</Label>
                        <div className="flex gap-3" role="radiogroup" aria-label="Accent color">
                            {accents.map((accentOption) => (
                                <button
                                    key={accentOption.id}
                                    role="radio"
                                    aria-checked={accent === accentOption.id}
                                    aria-label={accentOption.label}
                                    onClick={() => {
                                        setAccent(accentOption.id);
                                        setIsDirty(true);
                                    }}
                                    className={`
                                        ${accentOption.colorClass} 
                                        h-8 w-8 rounded-full cursor-pointer transition-all focus:outline-none
                                        ${accent === accentOption.id 
                                            ? 'ring-2 ring-primary ring-offset-4 ring-offset-background scale-110' 
                                            : 'hover:scale-105'}
                                    `}
                                    title={accentOption.label}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="border-t pt-6 flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={!isDirty || isLoading}
                    className="min-w-[120px]"
                >
                    {isLoading ? (
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

