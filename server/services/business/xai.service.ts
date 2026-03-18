import { injectable } from 'inversify';
import * as fs from 'fs';
import * as path from 'path';

interface FeatureLabel { label_en: string; label_ar: string; }

export interface EnrichedShapFeature {
    feature: string;
    impact: number;       // SHAP value (positive = increases risk)
    label_en: string;
    label_ar: string;
}

@injectable()
export class XaiService {
    private readonly labels: Record<string, FeatureLabel>;

    constructor() {
        const labelsPath = path.join(__dirname, '../../../shared/xai/feature_labels.json');
        try {
            this.labels = JSON.parse(fs.readFileSync(labelsPath, 'utf-8'));
        } catch {
            console.warn('[XaiService] Could not load feature_labels.json — labels will fall back to feature key names');
            this.labels = {};
        }
    }

    /**
     * Enrich a raw SHAP map (feature → impact value) with locale labels,
     * sorted by absolute impact descending.
     */
    enrichFeatures(shapValues: Record<string, number>): EnrichedShapFeature[] {
        return Object.entries(shapValues)
            .map(([feature, impact]) => ({
                feature,
                impact,
                label_en: this.labels[feature]?.label_en ?? feature,
                label_ar: this.labels[feature]?.label_ar ?? feature,
            }))
            .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
    }

    /**
     * Return the top N features as human-readable sentences in the requested locale.
     * Used by API responses for non-technical users.
     */
    toSentences(shapValues: Record<string, number>, locale: 'en' | 'ar' = 'en', topN = 5): string[] {
        return this.enrichFeatures(shapValues)
            .slice(0, topN)
            .map((f) => {
                const label = locale === 'ar' ? f.label_ar : f.label_en;
                if (locale === 'ar') {
                    const dir = f.impact > 0 ? 'يزيد من' : 'يقلل من';
                    return `${label} ${dir} خطر المغادرة`;
                }
                const dir = f.impact > 0 ? 'increases' : 'reduces';
                return `${label} ${dir} turnover risk`;
            });
    }
}
