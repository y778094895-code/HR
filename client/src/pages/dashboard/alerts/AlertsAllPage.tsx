import { useAlertStore } from '@/stores/business/alert.store';
import { useTranslation } from 'react-i18next';
import { AlertsSplitView } from '@/components/features/alerts/AlertsSplitView';

export default function AlertsAllPage() {
    const { t } = useTranslation();
    const { alerts, updateStatus, markAsRead } = useAlertStore();

    const handleUpdateAlert = (id: string, updates: any) => {
        if (updates.status) updateStatus(id, updates.status);
        if (updates.readAt) markAsRead(id);
    };

    return (
        <AlertsSplitView
            alerts={alerts}
            onUpdateAlert={handleUpdateAlert}
            title={t('alerts.allAlerts', 'كل التنبيهات')}
            description={t('alerts.allAlertsDesc', 'عرض وإدارة جميع التنبيهات النشطة والمؤرشفة في النظام.')}
        />
    );
}
