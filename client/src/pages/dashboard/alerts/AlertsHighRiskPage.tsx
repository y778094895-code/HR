import { useAlertStore } from '@/stores/business/alert.store';
import { useTranslation } from 'react-i18next';
import { AlertsSplitView } from '@/components/features/alerts/AlertsSplitView';

export default function AlertsHighRiskPage() {
    const { t } = useTranslation();
    const { alerts, updateStatus, markAsRead } = useAlertStore();

    // Show only CRITICAL and HIGH severity for this view
    const highRiskAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

    const handleUpdateAlert = (id: string, updates: any) => {
        if (updates.status) updateStatus(id, updates.status);
        if (updates.readAt) markAsRead(id);
    };

    return (
        <AlertsSplitView
            alerts={highRiskAlerts}
            onUpdateAlert={handleUpdateAlert}
            title={t('alerts.highRiskAlerts', 'تنبيهات عالية الخطورة')}
            description={t('alerts.highRiskAlertsDesc', 'هذه الحالات تتطلب استجابة فورية نظراً لدرجة خطورتها العالية على أمان واستقرار النظام.')}
        />
    );
}
