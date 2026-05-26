import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import { ProjectProvider } from './context/ProjectContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MyTasksPage from './pages/MyTasksPage';
import TeamPage from './pages/TeamPage';
import SettingsPage from './pages/SettingsPage';
import ProjectTasks from './components/projects/ProjectTasks';
import TaskDetailPage from './pages/TaskDetailPage';
import ProjectAnalytics from './components/projects/ProjectAnalytics';
import AcceptInvitationPage from './pages/AcceptInvitationPage';

// Simple placeholder tab panels
const TabPanel = ({ msg }) => (
  <div className="flex items-center justify-center h-full min-h-[300px]">
    <p className="text-sm text-gray-400 dark:text-gray-600">{msg} — coming soon.</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrgProvider>
          <ProjectProvider>
            <Router>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { borderRadius: '10px', background: '#1f2937', color: '#f9fafb', fontSize: '14px' },
                  success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
                }}
              />
              <Routes>
                <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardPage />} />

                  {/* Projects list */}
                  <Route path="projects" element={<ProjectsPage />} />

                  {/* Per-project detail with sub-tabs */}
                  <Route path="projects/:projectId" element={<ProjectDetailPage />}>
                    <Route index element={<Navigate to="tasks" replace />} />
                    <Route path="tasks"     element={<ProjectTasks />} />
                    <Route path="tasks/:taskId" element={<TaskDetailPage />} />
                    <Route path="analytics" element={<ProjectAnalytics />} />
                  </Route>

                  {/* Legacy sidebar routes */}
                  <Route path="projects/tasks"    element={<MyTasksPage />} />
                  <Route path="projects/analytics" element={<TabPanel msg="Analytics — select a project to view" />} />

                  <Route path="tasks"    element={<MyTasksPage />} />
                  <Route path="team"     element={<TeamPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </ProjectProvider>
        </OrgProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
