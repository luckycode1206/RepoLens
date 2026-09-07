import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { RepoLensLogo } from '../components/common/RepoLensLogo';
import { useApp, useWaterNavigate } from '../context';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { waterNavigate } = useWaterNavigate();
  const { theme } = useApp();

  const [email, setEmail] = useState('developer@repolens.io');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const isDark = theme !== 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthSuccess(true);
      setTimeout(() => {
        navigate('/app');
      }, 300);
    }, 550);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 sm:py-8 relative overflow-hidden transition-colors duration-300 select-none ${
        isDark ? 'bg-[#0D0F0D] text-[#F2F2F2]' : 'bg-[#F7F1E3] text-[#181D17]'
      }`}
    >
      {/* Background Depth & Subtle Gradient Noise/Aura */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 50% 18%, rgba(182, 255, 60, 0.05) 0%, transparent 60%), radial-gradient(circle at 80% 85%, rgba(56, 189, 248, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 50% 18%, rgba(4, 106, 56, 0.05) 0%, transparent 60%), radial-gradient(circle at 80% 85%, rgba(4, 106, 56, 0.03) 0%, transparent 50%)',
        }}
      />

      {/* Atmospheric Micro Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Header with Logo and Theme Switcher */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <button
          type="button"
          onClick={(e) => waterNavigate('/', e)}
          className="page-link transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container rounded-lg cursor-pointer"
        >
          <RepoLensLogo size="md" />
        </button>

        {/* Theme Switch Toggle */}
        <ThemeToggle size="md" />
      </header>

      {/* Main Single-Column Centered Card (~440px) */}
      <main className="relative z-10 w-full max-w-[450px] mx-auto my-auto py-8">
        <div
          className={`p-7 sm:p-9 rounded-2xl border transition-all duration-300 space-y-7 ${
            isDark
              ? 'bg-[#121512] border-[#2A2A2A] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
              : 'bg-[#FFFFFF] border-[#E0D7C6] shadow-[0_4px_24px_rgba(40,30,20,0.06)]'
          }`}
        >
          {/* Bold Headline & Descriptive Subtext */}
          <div className="space-y-2 text-center">
            <h1
              className={`font-sans text-2xl sm:text-[26px] font-bold tracking-tight ${
                isDark ? 'text-[#F2F2F2]' : 'text-[#181D17]'
              }`}
            >
              Sign In to RepoLens
            </h1>
            <p
              className={`text-xs sm:text-[13px] font-sans leading-relaxed ${
                isDark ? 'text-[#9A9A9A]' : 'text-[#6E685E]'
              }`}
            >
              Access your workspace AST telemetry, blast simulations, and code intelligence.
            </p>
          </div>

          {/* Two SSO Providers Side-by-Side (Equal Width) */}
          <div className="grid grid-cols-2 gap-3">
            {/* GitHub SSO */}
            <button
              type="button"
              onClick={() => navigate('/app')}
              className={`flex items-center justify-center gap-2.5 h-11 px-3.5 rounded-xl border font-sans text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ${
                isDark
                  ? 'bg-[#171B17] hover:bg-[#1F251F] text-[#F2F2F2] border-[#2A2A2A] hover:border-[#384238] hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[#B6FF3C]'
                  : 'bg-[#FAF6EE] hover:bg-[#F2ECE0] text-[#181D17] border-[#E0D7C6] hover:border-[#D0C5AF] hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-[#046A38]'
              }`}
            >
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </button>

            {/* GitLab SSO */}
            <button
              type="button"
              onClick={() => navigate('/app')}
              className={`flex items-center justify-center gap-2.5 h-11 px-3.5 rounded-xl border font-sans text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ${
                isDark
                  ? 'bg-[#171B17] hover:bg-[#1F251F] text-[#F2F2F2] border-[#2A2A2A] hover:border-[#384238] hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[#B6FF3C]'
                  : 'bg-[#FAF6EE] hover:bg-[#F2ECE0] text-[#181D17] border-[#E0D7C6] hover:border-[#D0C5AF] hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-[#046A38]'
              }`}
            >
              <svg className="w-4 h-4 fill-current text-[#FC6D26] flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.29-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 5.51 2a.48.48 0 0 1 .4.24l2.62 8.08h6.94l2.62-8.08a.48.48 0 0 1 .4-.24.42.42 0 0 1 .39.16l2.44 7.51 1.22 3.78a.84.84 0 0 1-.29.94z" />
              </svg>
              <span>GitLab</span>
            </button>
          </div>

          {/* "OR EMAIL" Divider with Horizontal Rules */}
          <div className="flex items-center gap-3">
            <div
              className={`flex-1 h-px ${
                isDark ? 'bg-[#242A24]' : 'bg-[#E5DDCB]'
              }`}
            />
            <span
              className={`text-[10px] font-mono font-semibold tracking-widest uppercase ${
                isDark ? 'text-[#7D8878]' : 'text-[#8A8275]'
              }`}
            >
              OR EMAIL
            </span>
            <div
              className={`flex-1 h-px ${
                isDark ? 'bg-[#242A24]' : 'bg-[#E5DDCB]'
              }`}
            />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className={`block font-sans text-xs font-medium ${
                  isDark ? 'text-[#E4E8E1]' : 'text-[#181D17]'
                }`}
              >
                Work Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs transition-all duration-200 focus:outline-none ${
                  isDark
                    ? 'bg-[#171B17] border-[#2A2A2A] text-[#F2F2F2] placeholder-[#646E60] focus:border-[#B6FF3C] focus:ring-1 focus:ring-[#B6FF3C]/40 focus:shadow-[0_0_12px_rgba(182,255,60,0.15)]'
                    : 'bg-[#FAF6EE] border-[#E0D7C6] text-[#181D17] placeholder-[#9E9588] focus:border-[#046A38] focus:ring-1 focus:ring-[#046A38]/40 focus:shadow-[0_0_12px_rgba(4,106,56,0.15)]'
                }`}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className={`block font-sans text-xs font-medium ${
                    isDark ? 'text-[#E4E8E1]' : 'text-[#181D17]'
                  }`}
                >
                  Workstation Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert('Password reset link has been dispatched to developer@repolens.io')
                  }
                  className={`text-xs font-mono font-semibold transition-colors hover:underline ${
                    isDark ? 'text-[#B6FF3C]' : 'text-[#046A38]'
                  }`}
                >
                  Forgot?
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border font-mono text-xs tracking-wider transition-all duration-200 focus:outline-none ${
                    isDark
                      ? 'bg-[#171B17] border-[#2A2A2A] text-[#F2F2F2] placeholder-[#646E60] focus:border-[#B6FF3C] focus:ring-1 focus:ring-[#B6FF3C]/40 focus:shadow-[0_0_12px_rgba(182,255,60,0.15)]'
                      : 'bg-[#FAF6EE] border-[#E0D7C6] text-[#181D17] placeholder-[#9E9588] focus:border-[#046A38] focus:ring-1 focus:ring-[#046A38]/40 focus:shadow-[0_0_12px_rgba(4,106,56,0.15)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 p-1 rounded-md transition-colors ${
                    isDark
                      ? 'text-[#7D8878] hover:text-[#F2F2F2] hover:bg-[#1E241E]'
                      : 'text-[#8A8275] hover:text-[#181D17] hover:bg-[#E8E0D0]'
                  }`}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.8} />
                  ) : (
                    <Eye size={16} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {/* "Remember this workstation" Checkbox */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    rememberMe
                      ? isDark
                        ? 'bg-[#B6FF3C] border-[#B6FF3C] text-[#0D0F0D]'
                        : 'bg-[#046A38] border-[#046A38] text-[#FFFFFF]'
                      : isDark
                      ? 'bg-[#171B17] border-[#2A2A2A] group-hover:border-[#3A443A]'
                      : 'bg-[#FAF6EE] border-[#E0D7C6] group-hover:border-[#D0C5AF]'
                  }`}
                >
                  {rememberMe && <Check size={12} strokeWidth={2.5} />}
                </div>
                <span
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`font-sans ${
                    isDark ? 'text-[#9A9A9A] group-hover:text-[#F2F2F2]' : 'text-[#6E685E] group-hover:text-[#181D17]'
                  }`}
                >
                  Remember this workstation
                </span>
              </label>
            </div>

            {/* Full-width Primary CTA Button */}
            <button
              type="submit"
              disabled={loading || authSuccess}
              className={`w-full h-11 rounded-xl font-sans text-xs font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 ${
                isDark
                  ? 'bg-[#B6FF3C] hover:bg-[#C4FF5E] text-[#0D0F0D] shadow-[0_0_20px_rgba(182,255,60,0.25)] hover:shadow-[0_0_28px_rgba(182,255,60,0.4)] focus-visible:ring-[#B6FF3C]'
                  : 'bg-[#046A38] hover:bg-[#03542C] text-[#FFFFFF] shadow-[0_2px_12px_rgba(4,106,56,0.25)] hover:shadow-[0_4px_16px_rgba(4,106,56,0.35)] focus-visible:ring-[#046A38]'
              } disabled:opacity-75 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
                  <span>Authenticating AST Session...</span>
                </>
              ) : authSuccess ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Session Verified! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight size={15} strokeWidth={2.2} />
                </>
              )}
            </button>
          </form>


          {/* Footer Link: Sign Up */}
          <div
            className={`text-center text-xs font-sans pt-1 ${
              isDark ? 'text-[#9A9A9A]' : 'text-[#6E685E]'
            }`}
          >
            <span>Don&apos;t have an account? </span>
            <button
              type="button"
              onClick={(e) => waterNavigate('/signup', e)}
              className={`page-link font-semibold hover:underline transition-colors cursor-pointer ${
                isDark ? 'text-[#B6FF3C]' : 'text-[#046A38]'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </main>

      {/* Security Verification Footnote */}
      <footer className="relative z-10 text-center text-xs font-mono max-w-5xl mx-auto w-full py-2">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] ${
            isDark
              ? 'bg-[#121512] border-[#2A2A2A] text-[#7D8878]'
              : 'bg-[#FFFFFF] border-[#E0D7C6] text-[#6E685E] shadow-sm'
          }`}
        >
          <ShieldCheck
            size={13}
            className={isDark ? 'text-[#B6FF3C]' : 'text-[#046A38]'}
          />
          <span>RepoLens AST Security Engine • 256-bit Workstation Token Authorization</span>
        </div>
      </footer>
    </div>
  );
};
