import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Lock, ArrowLeft, CloudLightning, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (newPassword.length < 8)
      errs.newPassword = "Password must be at least 8 characters";
    if (newPassword !== confirmPassword)
      errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      if (!err._rateLimitHandled) {
        const message =
          err.response?.data?.message ||
          "Failed to reset password. The link may be invalid or expired.";
        setErrors({ form: message });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card p-6 text-center max-w-md">
          <p className="text-gray-500 dark:text-gray-400">
            Invalid reset link.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium mt-4"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CloudLightning className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set new password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Enter your new password below
          </p>
        </div>

        <div className="card">
          {success ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Password updated!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting you to sign in...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft size={14} />
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {errors.form && (
                  <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg text-sm text-danger-700 dark:text-danger-400">
                    {errors.form}
                  </div>
                )}

                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword}
                  icon={<Lock size={16} />}
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  icon={<Lock size={16} />}
                  autoComplete="new-password"
                />

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full"
                  loading={loading}
                >
                  Reset Password
                </Button>
              </form>

              <div className="px-6 pb-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
