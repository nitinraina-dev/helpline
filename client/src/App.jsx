import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SubmitTicketPage from "./pages/SubmitTicketPage";
import CheckStatusPage from "./pages/CheckStatusPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import TicketDetailPage from "./pages/TicketDetailPage";
import HomePage from "./pages/HomePage";
import Layout from "./layouts/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/submit-ticket" element={<SubmitTicketPage />} />

          <Route path="/check-status" element={<CheckStatusPage />} />

          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}