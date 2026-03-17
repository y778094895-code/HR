import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Layouts & Pages
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';

// Feature Containers
import InterventionsContainer from '@/components/features/interventions/InterventionsDashboard';
import EmployeesPage from './pages/dashboard/EmployeesPage';
import EmployeeProfilePage from './pages/dashboard/EmployeeProfilePage';
import UserManagementContainer from '@/components/features/users/UserManagement';
import ImpactPage from './pages/dashboard/ImpactPage';
import PerformancePage from './pages/dashboard/PerformancePage';
import AttritionPage from './pages/dashboard/AttritionPage';
import TrainingPage from './pages/dashboard/TrainingPage';
import FairnessPage from './pages/dashboard/FairnessPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import HelpPage from './pages/dashboard/HelpPage';
// Alerts Center (PR-08)
import { AlertsRootLayout } from './components/features/alerts/AlertsRootLayout';
import AlertsAllPage from './pages/dashboard/alerts/AlertsAllPage';
import AlertsUnreadPage from './pages/dashboard/alerts/AlertsUnreadPage';
import AlertsHighRiskPage from './pages/dashboard/alerts/AlertsHighRiskPage';
import ResponseLogPage from './pages/dashboard/alerts/ResponseLogPage';
import CasesPage from './pages/dashboard/CasesPage';
import DataQualityPage from './pages/dashboard/DataQualityPage';
import RecommendationsPage from './pages/dashboard/RecommendationsPage';
import SalaryPage from './pages/dashboard/SalaryPage';
import AttendancePage from './pages/dashboard/AttendancePage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Login page */}
                <Route path="/login" element={<Login />} />

                {/* Default route - redirect to login */}
                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                {/* Protected dashboard routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Index Route: Matches /dashboard */}
                    <Route index element={<DashboardHome />} />

                    {/* Feature Routes */}
                    <Route
                        path="performance"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager']}>
                                <PerformancePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="attrition"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager']}>
                                <AttritionPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="training"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
                                <TrainingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="fairness"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <FairnessPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="reports"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager']}>
                                <ReportsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="profile" element={<EmployeeProfilePage />} />
                    <Route path="help" element={<HelpPage />} />

                    {/* Alerts Center - Unified Routing (PR-08) */}
                    <Route
                        path="alerts"
                        element={
                            <ProtectedRoute>
                                <AlertsRootLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="all" replace />} />
                        <Route path="all" element={<AlertsAllPage />} />
                        <Route path="unread" element={<AlertsUnreadPage />} />
                        <Route path="high-risk" element={<AlertsHighRiskPage />} />
                        <Route path="response-log" element={<ResponseLogPage />} />
                    </Route>
                    <Route
                        path="cases"
                        element={
                            <ProtectedRoute>
                                <CasesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="data-quality"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                                <DataQualityPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="recommendations"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager']}>
                                <RecommendationsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Legacy/Existing Feature Routes */}
                    <Route
                        path="interventions"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager']}>
                                <InterventionsContainer />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="impact"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager']}>
                                <ImpactPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                                <UserManagementContainer />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="salaries"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager', 'hr_manager']}>
                                <SalaryPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="attendance"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager', 'hr_manager']}>
                                <AttendancePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="employees"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
                                <EmployeesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="employees/:id"
                        element={
                            <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
                                <EmployeeProfilePage />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;