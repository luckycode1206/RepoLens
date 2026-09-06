import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RepoLensLogo } from '../components/common/RepoLensLogo';
import { useApp } from '../context';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useApp();

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container flex flex-col relative overflow-x-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface-container-high px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
            <RepoLensLogo size="lg" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 rounded-lg text-on-surface hover:bg-surface-container transition-colors font-headline-sm text-xs font-semibold"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-headline-sm text-xs font-semibold transition-all shadow-glow-lime"
          >
            <span>Launch Console</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Top Half: Edge-to-edge Video Section (Above action buttons & below sign-in bar) */}
      <section className="relative overflow-hidden pt-16 pb-14 border-b border-surface-container-high/40">
        {/* Full-width video background extending horizontally to both sides */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/lime_spark_B6FF2E_10s.mp4" type="video/mp4" />
          </video>
          {/* Subtle dark tint to maintain headline contrast */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Edge gradients blending smoothly with header and solid background */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low/90 backdrop-blur-md border border-surface-container-highest text-xs font-code">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="text-on-surface font-semibold">RepoLens</span>
            <span className="text-surface-variant">•</span>
            <span className="text-primary-container font-semibold tracking-wider">SEE BEYOND THE CODE</span>
          </div>

          <h1 className="font-headline-xl text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface max-w-4xl leading-tight drop-shadow-md">
            Understand the <span className="text-primary-container underline decoration-primary-container/40 underline-offset-8">Blast Radius</span> of Every Code Change
          </h1>
        </div>
      </section>

      {/* Other Half: Action Buttons on Solid Background as before */}
      <section className="py-12 px-4 lg:px-8 bg-background border-b border-surface-container-high">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate('/ingest')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-headline-sm text-sm font-semibold transition-all shadow-glow-lime hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              <span>Ingest Repository / Upload ZIP</span>
            </button>
            <button
              onClick={() => navigate('/app')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-highest text-on-surface font-headline-sm text-sm font-semibold transition-colors hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              <span>Explore Interactive Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section id="features" className="py-20 px-4 lg:px-8 border-b border-surface-container-high bg-surface-container-lowest/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface">
              Architectural Intelligence Built for Modern Engineering
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
              Replace guesswork with deterministic AST parsing, cross-module taint propagation, and change-risk telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              id="blast-radius"
              onClick={() => navigate('/blast-radius')}
              className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-primary-container/50 cursor-pointer transition-all space-y-3 group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">radar</span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary-container transition-colors">
                Blast Radius Engine
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Traverse 1-to-5 degree call graphs to locate direct and indirect dependents, affected API routes, and required unit tests.
              </p>
            </div>

            <div
              id="security"
              onClick={() => navigate('/security')}
              className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-error/50 cursor-pointer transition-all space-y-3 group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">security</span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-error transition-colors">
                Syntactic Taint Audit
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Scan for CWE-78 command injection, hardcoded secrets, and cryptographic entropy loss directly in your AST syntax trees.
              </p>
            </div>

            <div
              id="architecture"
              onClick={() => navigate('/architecture')}
              className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-secondary/50 cursor-pointer transition-all space-y-3 group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">hub</span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-secondary transition-colors">
                Layer Topology
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Interactive Canvas graph showing API gateways, domain services, persistence stores, afferent coupling, and instability metrics.
              </p>
            </div>

            <div
              onClick={() => navigate('/testing')}
              className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-primary-container/50 cursor-pointer transition-all space-y-3 group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">checklist</span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary-container transition-colors">
                Test Impact Analysis
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Execute targeted regression suites (8.2s vs 4m 12s full runner) using topological changed-symbol targeting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 lg:px-8 bg-surface-container-lowest/80 backdrop-blur-sm border-t border-surface-container-high text-xs text-outline font-code">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RepoLensLogo size="md" />
            <span>© 2026 RepoLens. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-outline">
            <a
              href="https://github.com/luckycode1206/RepoLens"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary-container transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
            <button onClick={() => navigate('/app')} className="hover:text-primary-container">
              Console
            </button>
            <button onClick={() => navigate('/settings')} className="hover:text-primary-container">
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
