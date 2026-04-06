import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, ArrowLeft, CloudLightning, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Invalid email format";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email.trim());
      if (result.resetUrl) {
        setResetUrl(result.resetUrl);
      }
      setSent(true);
    } catch (err: any) {
      if (!err._rateLimitHandled) {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CloudLightning className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset your password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="card">
          {sent ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If an account with <strong>{email}</strong> exists, we&apos;ve
                sent a password reset link. Check your inbox (and spam folder).
              </p>
              {resetUrl && (
                <div className="p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg text-xs">
                  <p className="font-semibold text-warning-700 dark:text-warning-400 mb-1">
                    Dev mode only
                  </p>
                  <a
                    href={resetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline break-all"
                  >
                    Open reset link
                  </a>
                </div>
              )}
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
              >
                <ArrowLeft size={14} />
                Back to Sign In
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
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  icon={<Mail size={16} />}
                  autoComplete="email"
                />

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full"
                  loading={loading}
                >
                  Send Reset Link
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

export default ForgotPasswordPage;
