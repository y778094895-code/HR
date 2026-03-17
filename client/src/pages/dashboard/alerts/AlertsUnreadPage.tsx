import { useAlertStore } from '@/stores/business/alert.store';
import { useTranslation } from 'react-i18next';
import { AlertsSplitView } from '@/components/features/alerts/AlertsSplitView';

export default function AlertsUnreadPage() {
    const { t } = useTranslation();
    const { alerts, updateStatus, markAsRead } = useAlertStore();

    const unreadAlerts = alerts.filter(a => !a.readAt);

    const handleUpdateAlert = (id: string, updates: any) => {
        if (updates.status) updateStatus(id, updates.status);
        if (updates.readAt) markAsRead(id);
    };

    return (
        <AlertsSplitView
            alerts={unreadAlerts}
            onUpdateAlert={handleUpdateAlert}
            title={t('alerts.unreadAlerts', 'تنبيهات غير مقروءة')}
            description={t('alerts.unreadAlertsDesc', 'هذه التنبيهات تتطلب مراجعتك الفورية لاتخاذ الإجراءات اللازمة.')}
        />
    );
}

