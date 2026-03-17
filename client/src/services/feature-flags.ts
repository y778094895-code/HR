export type FeatureFlag = 'websocket_updates' | 'new_dashboard' | 'beta_features';

class FeatureFlagService {
    private flags: Record<FeatureFlag, boolean> = {
        'websocket_updates': true,
        'new_dashboard': false,
        'beta_features': false
    };

    constructor() {
        // Load overrides from localStorage or Env
        const envFlags = import.meta.env.VITE_FEATURE_FLAGS;
        if (envFlags) {
            try {
                const parsed = JSON.parse(envFlags);
                this.flags = { ...this.flags, ...parsed };
            } catch (e) {
                console.error('Failed to parse feature flags from env', e);
            }
        }
    }

    isEnabled(flag: FeatureFlag): boolean {
        return this.flags[flag] ?? false;
    }

    enable(flag: FeatureFlag) {
        this.flags[flag] = true;
    }

    disable(flag: FeatureFlag) {
        this.flags[flag] = false;
    }
}

export const featureFlags = new FeatureFlagService();
