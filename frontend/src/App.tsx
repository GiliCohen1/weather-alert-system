import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import toast, { Toaster, ToastBar } from "react-hot-toast";
import { X } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navigation from "./pages/Navigation";
import Footer from "./components/Footer";
import DashboardPage from "./pages/DashboardPage";
import WeatherPage from "./pages/HomePage";
import AlertsPage from "./pages/AlertsPage";
import StatusPage from "./pages/StatusPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "14px",
                  },
                }}
              >
                {(t) => (
                  <ToastBar
                    toast={t}
                    style={{ ...t.style, padding: "8px 12px" }}
                  >
                    {({ icon, message }) => (
                      <div className="flex items-center gap-2 w-full">
                        {icon}
                        <div className="flex-1">{message}</div>
                        {t.type !== "loading" && (
                          <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Dismiss"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </ToastBar>
                )}
              </Toaster>
              <Navigation />
              <main className="flex-1 py-6">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/status" element={<StatusPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
