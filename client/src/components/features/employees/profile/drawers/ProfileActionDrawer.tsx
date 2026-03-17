import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EmployeeProfileBundle, RiskDriver } from '@/services/resources/profileDataAdapter';
import { CreateCaseDrawer } from './CreateCaseDrawer';
import { AssignInterventionDrawer } from './AssignInterventionDrawer';
import { XAIDetailDrawer } from './XAIDetailDrawer';
import { CaseDetailsDrawer } from './CaseDetailsDrawer';

type DrawerMode = 'NONE' | 'CREATE_CASE' | 'ASSIGN_INTERVENTION' | 'XAI_EXPLANATION' | 'VIEW_CASE';

interface DrawerState {
    mode: DrawerMode;
    metadata?: any;
}

interface ProfileDrawerContextType {
    state: DrawerState;
    openDrawer: (mode: DrawerMode, metadata?: any) => void;
    closeDrawer: () => void;
}

const ProfileDrawerContext = createContext<ProfileDrawerContextType | undefined>(undefined);

export function useProfileDrawer() {
    const context = useContext(ProfileDrawerContext);
    if (!context) {
        throw new Error('useProfileDrawer must be used within ProfileActionDrawerProvider');
    }
    return context;
}

interface ProviderProps {
    children: ReactNode;
    profile: EmployeeProfileBundle;
    onActionComplete: () => void;
}

export function ProfileActionDrawerProvider({ children, profile, onActionComplete }: ProviderProps) {
    const [state, setState] = useState<DrawerState>({ mode: 'NONE' });

    const openDrawer = (mode: DrawerMode, metadata?: any) => {
        setState({ mode, metadata });
    };

    const closeDrawer = () => {
        setState({ mode: 'NONE', metadata: undefined });
    };

    const handleSuccess = () => {
        onActionComplete();
        closeDrawer();
    };

    return (
        <ProfileDrawerContext.Provider value={{ state, openDrawer, closeDrawer }}>
            {children}

            <CreateCaseDrawer
                open={state.mode === 'CREATE_CASE'}
                onOpenChange={(v) => !v && closeDrawer()}
                profile={profile}
                onSuccess={handleSuccess}
            />

            <AssignInterventionDrawer
                open={state.mode === 'ASSIGN_INTERVENTION'}
                onOpenChange={(v) => !v && closeDrawer()}
                profile={profile}
                onSuccess={handleSuccess}
            />

            <XAIDetailDrawer
                open={state.mode === 'XAI_EXPLANATION'}
                onOpenChange={(v) => !v && closeDrawer()}
                driver={state.metadata?.driver as RiskDriver | null}
            />

            <CaseDetailsDrawer
                open={state.mode === 'VIEW_CASE'}
                onOpenChange={(v) => !v && closeDrawer()}
                profile={profile}
                caseId={state.metadata?.caseId}
            />
        </ProfileDrawerContext.Provider>
    );
}
