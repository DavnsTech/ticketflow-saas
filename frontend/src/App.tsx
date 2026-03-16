import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TicketListPage from "./pages/TicketListPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import TeamPage from "./pages/TeamPage";
import Layout from "./components/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DefaultRedirect() {
  const { user } = useAuth();
  const target = user?.role === "USER" ? "/tickets" : "/dashboard";
  return <Navigate to={target} replace />;
}

function StaffOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role === "USER") return <Navigate to="/tickets" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DefaultRedirect />} />
        <Route path="dashboard" element={<StaffOnly><DashboardPage /></StaffOnly>} />
        <Route path="tickets" element={<TicketListPage />} />
        <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
        <Route path="team" element={<StaffOnly><TeamPage /></StaffOnly>} />
      </Route>
    </Routes>
  );
}
