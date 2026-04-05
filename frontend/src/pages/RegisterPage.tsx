import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { UserPlus, Mail, Lock, User, CloudLightning } from "lucide-react";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Invalid email format";
    if (password.length < 8) errs.password = "Minimum 8 characters";
    if (password !== confirmPassword)
      errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/");
    } catch {
      setErrors({ form: "Registration failed. Email may already be in use." });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CloudLightning className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create an account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Start monitoring weather conditions
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errors.form && (
              <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg text-sm text-danger-700 dark:text-danger-400">
                {errors.form}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              icon={<User size={16} />}
              autoComplete="name"
            />

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

            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock size={16} />}
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
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
              <UserPlus size={16} />
              Create Account
            </Button>
          </form>

          <div className="px-6 pb-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
