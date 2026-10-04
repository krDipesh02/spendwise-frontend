import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import BudgetsPage from "./pages/BudgetsPage";
import CategoriesPage from "./pages/CategoriesPage";
import AutomationPage from "./pages/AutomationPage";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";
import TelegramAdminPage from "./pages/TelegramAdminPage";
import AdminRoute from "./components/AdminRoute";
import PasswordSetupPage from "./pages/PasswordSetupPage";
import { SessionProvider } from "./session";

export default function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup-password" element={<PasswordSetupPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="admin/telegram" element={<AdminRoute><TelegramAdminPage /></AdminRoute>} />
        </Route>
      </Routes>
    </SessionProvider>
  );
}
