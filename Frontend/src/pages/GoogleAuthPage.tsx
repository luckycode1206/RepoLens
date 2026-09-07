import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShieldCheck, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { RepoLensLogo } from '../components/common/RepoLensLogo';
import { useApp } from '../context';
import { DoodleBackdrop } from '../components/common/DoodleBackdrop';

interface GoogleAccount {
  id: string;
  name: string;
  email: string;
  avatarBg: string;
  initial: string;
}

const MOCK_ACCOUNTS: GoogleAccount[] = [
  {
    id: 'acc-1',
    name: 'Alex Vance',
    email: 'alex.vance@blackmesa.tech',
    avatarBg: 'bg-emerald-600',
    initial: 'A',
  },
  {
    id: 'acc-2',
    name: 'RepoLens Developer',
    email: 'developer@repolens.io',
    avatarBg: 'bg-lime-600',
    initial: 'R',
  },
];

export const GoogleAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useApp();
  const isDark = theme !== 'light';

  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const returnTo = mode === 'signup' ? '/signup' : '/login';
  const destination = mode === 'signup' ? '/ingest' : '/app';

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  const handleSelectAccount = (accId: string) => {
    setSelectedAccount(accId);
    setIsAuthenticating(true);
    setTimeout(() => {
      navigate(destination);
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    setIsAuthenticating(true);
    setTimeout(() => {
      navigate(destination);
    }, 600);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 sm:py-8 relative overflow-hidden transition-colors duration-300 select-none ${
        isDark ? 'bg-[#0D0F0D] text-[#F2F2F2]' : 'bg-[#F7F1E3] text-[#181D17]'
      }`}
    >
      {/* Interactive Doodle Backdrop */}
      <DoodleBackdrop />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          type="button"
          onClick={() => navigate(returnTo)}
          className="inline-flex items-center gap-2 text-xs font-mono tracking-wide text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {mode === 'signup' ? 'Sign Up' : 'Sign In'}</span>
        </button>

        <RepoLensLogo size="sm" />
      </header>

      {/* Main Google Auth Card */}
      <main className="relative z-10 w-full max-w-[460px] mx-auto my-auto py-8">
        <div
          className={`p-7 sm:p-9 rounded-2xl border transition-all duration-300 space-y-6 relative overflow-hidden ${
            isDark
              ? 'bg-[#121512] border-[#2A2A2A] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
              : 'bg-[#FFFFFF] border-[#E0D7C6] shadow-[0_4px_24px_rgba(40,30,20,0.06)]'
          }`}
        >
          {/* Top Progress Bar when authenticating */}
          {isAuthenticating && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-surface-container-high overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse w-full" />
            </div>
          )}

          {/* Google 4-Color Logo & Headline */}
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <svg className="w-9 h-9" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            <h1
              className={`font-sans text-xl sm:text-2xl font-semibold tracking-tight ${
                isDark ? 'text-[#F2F2F2]' : 'text-[#181D17]'
              }`}
            >
              {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
            </h1>

            <div className="flex items-center justify-center gap-1.5 text-xs font-sans text-on-surface-variant">
              <span>to continue to</span>
              <span className={`font-semibold ${isDark ? 'text-[#B6FF3C]' : 'text-[#046A38]'}`}>
                RepoLens
              </span>
            </div>
          </div>

          {/* Account Selection List */}
          {!showCustomInput ? (
            <div className="space-y-2 pt-1">
              <p
                className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                  isDark ? 'text-[#7D8878]' : 'text-[#8A8275]'
                }`}
              >
                Choose an account
              </p>

              <div className="divide-y divide-surface-container-high/40 rounded-xl border border-surface-container-high/60 overflow-hidden">
                {MOCK_ACCOUNTS.map((acc) => {
                  const isSelected = selectedAccount === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      disabled={isAuthenticating}
                      onClick={() => handleSelectAccount(acc.id)}
                      className={`w-full flex items-center justify-between p-3.5 text-left transition-all duration-150 cursor-pointer ${
                        isDark
                          ? 'hover:bg-[#1A201A] active:bg-[#222B22]'
                          : 'hover:bg-[#F7F2E7] active:bg-[#ECE3D0]'
                      } ${isSelected ? 'opacity-80' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-bold flex items-center justify-center text-sm flex-shrink-0`}
                        >
                          {acc.initial}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs sm:text-[13px] font-semibold truncate ${
                              isDark ? 'text-[#F2F2F2]' : 'text-[#181D17]'
                            }`}
                          >
                            {acc.name}
                          </p>
                          <p
                            className={`text-[11px] truncate ${
                              isDark ? 'text-[#9A9A9A]' : 'text-[#6E685E]'
                            }`}
                          >
                            {acc.email}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />
                      ) : (
                        <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })}

                {/* Use another account */}
                <button
                  type="button"
                  disabled={isAuthenticating}
                  onClick={() => setShowCustomInput(true)}
                  className={`w-full flex items-center gap-3 p-3.5 text-left transition-all duration-150 cursor-pointer ${
                    isDark
                      ? 'hover:bg-[#1A201A] active:bg-[#222B22]'
                      : 'hover:bg-[#F7F2E7] active:bg-[#ECE3D0]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border border-dashed flex-shrink-0 ${
                      isDark
                        ? 'border-surface-variant text-on-surface-variant'
                        : 'border-surface-variant text-on-surface-variant'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs sm:text-[13px] font-semibold ${
                      isDark ? 'text-[#F2F2F2]' : 'text-[#181D17]'
                    }`}
                  >
                    Use another Google account
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="google-email-input"
                  className={`text-xs font-semibold ${
                    isDark ? 'text-[#C8D3C5]' : 'text-[#3E4A3B]'
                  }`}
                >
                  Email or phone
                </label>
                <input
                  id="google-email-input"
                  type="email"
                  required
                  autoFocus
                  placeholder="you@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className={`w-full h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-sans transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-[#171B17] border-[#2A2A2A] text-[#F2F2F2] focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-[#FAF6EE] border-[#E0D7C6] text-[#181D17] focus:border-blue-600 focus:ring-blue-600/20'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Back to list
                </button>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isAuthenticating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Continue</span>
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Consent Notice */}
          <div
            className={`pt-3 border-t text-[11px] leading-relaxed text-center ${
              isDark ? 'border-[#242A24] text-[#7D8878]' : 'border-[#E5DDCB] text-[#8A8275]'
            }`}
          >
            To continue, Google will share your name, email address, language preference, and profile picture with RepoLens.
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-on-surface-variant">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Secured with OAuth 2.0 & SOC-2 compliance</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-on-surface-variant/70">
        &copy; 2026 RepoLens, Inc. Built for high-velocity software engineering.
      </footer>
    </div>
  );
};
