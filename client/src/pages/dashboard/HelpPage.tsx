import React from 'react';
import { TabsContainer, TabItem } from '@/components/ui/navigation/TabsContainer';
import { KnowledgeBase } from '@/components/features/help/KnowledgeBase';
import { SupportTickets } from '@/components/features/help/SupportTickets';
import { Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

export default function HelpPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const view = searchParams.get('view') || 'guide';

    const getTitle = () => {
        switch (view) {
            case 'guide': return t('nav.userGuide', 'User Guide');
            case 'faq': return t('nav.faq', 'FAQ');
            case 'support': return t('nav.support', 'Support');
            default: return t('help.title', 'Help Center');
        }
    };

    const ContactSupport = () => (
        <div className="max-w-2xl mx-auto space-y-8 py-12 text-center animate-in fade-in mt-4">
            <h2 className="text-2xl font-bold">{t('help.stillNeedHelp', 'هل ما زلت بحاجة للمساعدة؟')}</h2>
            <p className="text-muted-foreground">{t('help.supportHours', 'فريق الدعم متاح من الاثنين إلى الجمعة، 9 صباحاً - 5 مساءً.')}</p>

            <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-8 border rounded-xl bg-card hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                        <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t('help.emailSupport', 'الدعم عبر البريد الإلكتروني')}</h3>
                    <p className="text-blue-600 font-medium">support@smart-hr.com</p>
                    <p className="text-xs text-muted-foreground mt-2">{t('help.emailResponseTime', 'وقت الاستجابة: ~24 ساعة')}</p>
                </div>

                <div className="p-8 border rounded-xl bg-card hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                        <Phone className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t('help.phoneSupport', 'الدعم الهاتفي')}</h3>
                    <p className="text-green-600 font-medium">+1 (555) 123-4567</p>
                    <p className="text-xs text-muted-foreground mt-2">{t('help.urgentLine', 'خط مباشر للحالات الحرجة')}</p>
                </div>
            </div>
        </div>
    );

    const renderTabs = (): TabItem[] => {
        switch (view) {
            case 'guide':
                return [
                    {
                        value: 'onboarding',
                        label: t('help.tabs.onboarding', 'Onboarding'),
                        content: (
                            <div className="mt-4">
                                <KnowledgeBase />
                            </div>
                        )
                    },
                    {
                        value: 'modules',
                        label: t('help.tabs.modules', 'Modules'),
                        content: (
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl mt-4">
                                {t('common.comingSoon', 'Coming Soon')}
                            </div>
                        )
                    },
                    {
                        value: 'features',
                        label: t('help.tabs.features', 'Features'),
                        content: (
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl mt-4">
                                {t('common.comingSoon', 'Coming Soon')}
                            </div>
                        )
                    }
                ];
            case 'faq':
                return [
                    {
                        value: 'general',
                        label: t('help.tabs.generalFaq', 'General FAQ'),
                        content: (
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl mt-4">
                                {t('common.comingSoon', 'Coming Soon')}
                            </div>
                        )
                    },
                    {
                        value: 'technical',
                        label: t('help.tabs.techFaq', 'Technical FAQ'),
                        content: (
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl mt-4">
                                {t('common.comingSoon', 'Coming Soon')}
                            </div>
                        )
                    }
                ];
            case 'support':
                return [
                    {
                        value: 'tickets',
                        label: t('help.tabs.myTickets', 'My Tickets'),
                        content: (
                            <div className="mt-4">
                                <SupportTickets />
                            </div>
                        )
                    },
                    {
                        value: 'contact',
                        label: t('help.tabs.contactUs', 'Contact Us'),
                        content: <ContactSupport />
                    }
                ];
            default:
                return [];
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{getTitle()}</h1>
                    <p className="text-muted-foreground">{t('help.description', 'Find answers, manage tickets, and contact support.')}</p>
                </div>
            </div>

            <TabsContainer
                tabs={renderTabs()}
                syncWithUrl="tab"
            />
        </div>
    );
}
