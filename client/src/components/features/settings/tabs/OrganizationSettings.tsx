// OrganizationSettings Component
// Organization and workspace settings tab

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { useToast } from '@/components/ui/overlays/use-toast';
import { useTranslation } from 'react-i18next';
import { useOrganizationSettings } from '@/hooks/useSettings';
import { Building2, Globe, Clock, Calendar, Save, Loader2, AlertCircle } from 'lucide-react';

export const OrganizationSettings: React.FC = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { data: orgSettings, isLoading, error, save } = useOrganizationSettings();

    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        size: '',
        timezone: '',
        fiscalYearStart: '',
        language: 'ar' as 'ar' | 'en',
        dateFormat: 'DD/MM/YYYY'
    });

    // Update form when data loads
    useEffect(() => {
        if (orgSettings) {
            setFormData({
                companyName: orgSettings.companyName || '',
                industry: orgSettings.industry || '',
                size: orgSettings.size || '',
                timezone: orgSettings.timezone || '',
                fiscalYearStart: orgSettings.fiscalYearStart || '',
                language: orgSettings.language || 'ar',
                dateFormat: orgSettings.dateFormat || 'DD/MM/YYYY'
            });
        }
    }, [orgSettings]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await save(formData);
            toast({
                title: t('common.success', 'Success'),
                description: t('settings.organization.saved', 'Organization settings updated successfully.'),
            });
            setIsDirty(false);
        } catch (error) {
            toast({
                title: t('common.error', 'Error'),
                description: t('settings.organization.error', 'Failed to update organization settings.'),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const industries = [
        { value: 'technology', label: t('settings.organization.industry.tech', 'Technology') },
        { value: 'healthcare', label: t('settings.organization.industry.healthcare', 'Healthcare') },
        { value: 'finance', label: t('settings.organization.industry.finance', 'Finance') },
        { value: 'education', label: t('settings.organization.industry.education', 'Education') },
        { value: 'manufacturing', label: t('settings.organization.industry.manufacturing', 'Manufacturing') },
        { value: 'retail', label: t('settings.organization.industry.retail', 'Retail') },
        { value: 'other', label: t('settings.organization.industry.other', 'Other') }
    ];

    const companySizes = [
        { value: '1-10', label: t('settings.organization.size.1-10', '1-10 employees') },
        { value: '11-50', label: t('settings.organization.size.11-50', '11-50 employees') },
        { value: '51-100', label: t('settings.organization.size.51-100', '51-100 employees') },
        { value: '101-500', label: t('settings.organization.size.101-500', '101-500 employees') },
        { value: '501-1000', label: t('settings.organization.size.501-1000', '501-1000 employees') },
        { value: '1000+', label: t('settings.organization.size.1000+', '1000+ employees') }
    ];

    const timezones = [
        { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST)' },
        { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'America/New_York (EST)' },
        { value: 'Europe/London', label: 'Europe/London (GMT)' }
    ];

    const fiscalYearOptions = [
        { value: 'january', label: t('settings.organization.fiscalYear.january', 'January') },
        { value: 'april', label: t('settings.organization.fiscalYear.april', 'April') },
        { value: 'july', label: t('settings.organization.fiscalYear.july', 'July') },
        { value: 'october', label: t('settings.organization.fiscalYear.october', 'October') }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* API Error Notice */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-800">{t('settings.organization.apiError', 'Using local defaults')}</p>
                        <p className="text-sm text-yellow-700 mt-1">
                            {t('settings.organization.apiErrorDesc', 'Organization settings are currently using local defaults. Changes will be persisted locally.')}
                        </p>
                    </div>
                </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.organization.basicInfo', 'Basic Information')}</h3>
                </div>
                
                <div className="grid gap-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">{t('settings.organization.companyName', 'Company Name')}</Label>
                        <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                            placeholder={t('settings.organization.companyNamePlaceholder', 'Enter company name')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="industry">{t('settings.organization.industry.label', 'Industry')}</Label>
                        <select
                            id="industry"
                            className="w-full p-2 border rounded-md bg-background"
                            value={formData.industry}
                            onChange={(e) => handleChange('industry', e.target.value)}
                        >
                            <option value="">{t('settings.organization.industrySelect', 'Select industry')}</option>
                            {industries.map(ind => (
                                <option key={ind.value} value={ind.value}>{ind.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="size">{t('settings.organization.size.label', 'Company Size')}</Label>
                        <select
                            id="size"
                            className="w-full p-2 border rounded-md bg-background"
                            value={formData.size}
                            onChange={(e) => handleChange('size', e.target.value)}
                        >
                            <option value="">{t('settings.organization.sizeSelect', 'Select company size')}</option>
                            {companySizes.map(size => (
                                <option key={size.value} value={size.value}>{size.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Regional Settings */}
            <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">{t('settings.organization.regional', 'Regional Settings')}</h3>
                </div>

                <div className="grid gap-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="timezone">{t('settings.organization.timezone', 'Timezone')}</Label>
                        <select
                            id="timezone"
                            className="w-full p-2 border rounded-md bg-background"
                            value={formData.timezone}
                            onChange={(e) => handleChange('timezone', e.target.value)}
                        >
                            <option value="">{t('settings.organization.timezoneSelect', 'Select timezone')}</option>
                            {timezones.map(tz => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="language">{t('settings.organization.language', 'Default Language')}</Label>
                        <select
                            id="language"
                            className="w-full p-2 border rounded-md bg-background"
                            value={formData.language}
                            onChange={(e) => handleChange('language', e.target.value)}
                        >
                            <option value="ar">{t('settings.organization.arabic', 'العربية (Arabic)')}</option>
                            <option value="en">{t('settings.organization.english', 'English')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateFormat">{t('settings.organization.dateFormat', 'Date Format')}</Label>
                        <select
                            id="dateFormat"
                            className="w-full p-2 border rounded-md bg-background"
                            value={formData.dateFormat}
                            onChange={(e) => handleChange('dateFormat', e.target.value)}
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fiscalYearStart">{t('settings.organization.fiscalYear', 'Fiscal Year Start')}</Label>
                        <select
                            id="fiscalYearStart"
                            className="w-full p-2 border rounded-md bg-background"
                            value={formData.fiscalYearStart}
                            onChange={(e) => handleChange('fiscalYearStart', e.target.value)}
                        >
                            <option value="">{t('settings.organization.fiscalYearSelect', 'Select fiscal year start')}</option>
                            {fiscalYearOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

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

