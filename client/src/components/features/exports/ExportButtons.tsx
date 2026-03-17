import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/buttons/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type ExportType = 'pdf' | 'excel';

interface ExportButtonsProps {
    onExport: (type: ExportType) => Promise<void>;
    isLoading?: boolean;
    className?: string;
    showPdf?: boolean;
    showExcel?: boolean;
}

export function ExportButtons({
    onExport,
    isLoading = false,
    className,
    showPdf = true,
    showExcel = true,
}: ExportButtonsProps) {
    const { t } = useTranslation();
    const [loadingType, setLoadingType] = useState<ExportType | null>(null);

    const handleExport = async (type: ExportType) => {
        if (isLoading || loadingType) return;

        try {
            setLoadingType(type);
            await onExport(type);
        } catch (error) {
            console.error(`Export ${type} failed:`, error);
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showPdf && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={isLoading || !!loadingType}
                >
                    <FileDown className="mr-2 h-4 w-4" />
                    {loadingType === 'pdf' ? t('common.exporting') : t('common.pdf')}
                </Button>
            )}
            {showExcel && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('excel')}
                    disabled={isLoading || !!loadingType}
                >
                    <FileDown className="mr-2 h-4 w-4 text-green-600" />
                    {loadingType === 'excel' ? t('common.exporting') : t('common.excel')}
                </Button>
            )}
        </div>
    );
}
