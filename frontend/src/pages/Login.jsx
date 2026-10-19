import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Login = ({ initialForgotMode = false }) => {
  const { t } = useTranslation();
  const { login, forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password mode states
  const [isForgotMode, setIsForgotMode] = useState(initialForgotMode);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request code, 2 = Verify code & New password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [demoOtpBadge, setDemoOtpBadge] = useState('');

  // Dropdown
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsForgotMode(initialForgotMode);
    if (initialForgotMode) {
      setForgotStep(1);
    }
  }, [initialForgotMode]);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  // Switch to Forgot Password
  const handleOpenForgotMode = () => {
    setIsForgotMode(true);
    setForgotEmail(email || '');
    setForgotStep(1);
    setError('');
    setSuccessMsg('');
    setDemoOtpBadge('');
  };

  // Switch back to Login
  const handleBackToLogin = () => {
    setIsForgotMode(false);
    setForgotStep(1);
    setError('');
    setDemoOtpBadge('');
  };

  // Step 1: Request OTP / Verification Code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotEmail) {
      setError(t('auth.enter_email_first', 'Please enter your registered email address'));
      return;
    }

    setLoading(true);
    const res = await forgotPassword(forgotEmail);
    setLoading(false);

    if (res.success) {
      setForgotStep(2);
      setSuccessMsg(res.message || 'Verification code sent!');
      if (res.otp) {
        setDemoOtpBadge(res.otp);
        setOtp(res.otp); // Pre-fill convenience for user testing
      }
    } else {
      setError(res.message);
    }
  };

  // Step 2: Submit Reset Password with OTP
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwords_do_not_match', 'New passwords do not match'));
      return;
    }

    setLoading(true);
    const res = await resetPassword(forgotEmail, otp.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || t('auth.password_reset_success', 'Password reset successfully!'));
      setEmail(forgotEmail);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setDemoOtpBadge('');

      // Auto return to login after short delay
      setTimeout(() => {
        setIsForgotMode(false);
        setForgotStep(1);
      }, 2000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex flex-col justify-between transition-colors">
      {/* Top Header: Brand Logo, Language Selector & Theme Toggle */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-500/20">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-300 dark:to-teal-300 font-heading">
              KrishiSetu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition"
              title="Change Language"
            >
              <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="uppercase">{currentLanguage}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-36 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setLangDropdownOpen(false)}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                      currentLanguage === lang.code
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] uppercase text-slate-400">({lang.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 hover:text-emerald-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container: Centered Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all duration-200">
          
          {/* Brand Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/25">
              {isForgotMode ? <KeyRound className="h-8 w-8" /> : <Sprout className="h-8 w-8" />}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                {isForgotMode ? t('auth.reset_password', 'Reset Password') : 'KrishiSetu'}
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {isForgotMode
                  ? t('auth.reset_password_subtitle', 'Enter your registered email to reset your account password.')
                  : 'Connecting Farmers to Better Farming'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Login / Register) */}
          <div className="mt-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                if (isForgotMode) handleBackToLogin();
              }}
              className={`rounded-xl py-2 text-xs font-bold transition ${
                !isForgotMode
                  ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t('nav.login', 'Login')}
            </button>
            <Link
              to="/register"
              className="rounded-xl py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
            >
              {t('nav.register', 'Register')}
            </Link>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 animate-in fade-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: STANDARD LOGIN FORM */}
          {!isForgotMode && (
            <form className="mt-5 space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('auth.email_address', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@krishisetu.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('auth.password', 'Password')}
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenForgotMode}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition hover:underline"
                  >
                    {t('auth.forgot_password', 'Forgot password?')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-green-700 transition duration-150 disabled:opacity-50"
              >
                {loading ? t('common.loading', 'Loading...') : `${t('nav.login', 'Login')} to Dashboard`}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* MODE 2: FORGOT / RESET PASSWORD FLOW */}
          {isForgotMode && (
            <div className="mt-5 space-y-4">
              {/* Step 1: Enter email & request verification code */}
              {forgotStep === 1 && (
                <form className="space-y-4" onSubmit={handleRequestResetCode}>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {t('auth.email_address', 'Registered Email Address')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="farmer@krishisetu.com"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-green-700 transition duration-150 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating Code...
                      </span>
                    ) : (
                      <>
                        {t('auth.send_code', 'Send Verification Code')}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('auth.back_to_login', 'Back to Login')}
                  </button>
                </form>
              )}

              {/* Step 2: Enter code & set new password */}
              {forgotStep === 2 && (
                <form className="space-y-4" onSubmit={handleResetSubmit}>
                  {demoOtpBadge && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Verification Code:</span>
                        </div>
                        <span className="rounded-lg bg-emerald-600 px-2 py-0.5 font-mono text-xs font-bold text-white shadow-sm">
                          {demoOtpBadge}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-80">
                        Code sent for <strong className="font-semibold">{forgotEmail}</strong>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {t('auth.verification_code', '6-Digit Verification Code')}
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-mono font-bold tracking-widest text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {t('auth.new_password', 'New Password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {t('auth.confirm_new_password', 'Confirm New Password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-green-700 transition duration-150 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Updating Password...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        {t('auth.set_new_password', 'Set New Password & Login')}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={handleRequestResetCode}
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      {t('auth.resend_code', 'Resend Code')}
                    </button>
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium transition"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      {t('auth.back_to_login', 'Back to Login')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer note inside card */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline dark:text-emerald-400">
              {t('nav.register', 'Register')} here
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} KrishiSetu Platform. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Login;
