import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RepoLensLogo } from '../components/common/RepoLensLogo';
import { useApp } from '../context';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useApp();

  // Scroll Progress Tracking
  const [scrollProgress, setScrollProgress] = useState(0);

  // Active Simulation Trigger for Interactive Blast Ripple
  const [activeSimulation, setActiveSimulation] = useState<'auth' | 'jwt' | 'db'>('auth');

  // Intersection Observer Visibility Tracking
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});
  const featuresRef = useRef<HTMLElement>(null);
  const simulationRef = useRef<HTMLElement>(null);
  const ingestRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    const refs = [featuresRef.current, simulationRef.current, ingestRef.current];
    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const simulationData = {
    auth: {
      sourceFile: 'services/auth_service.py',
      symbol: 'def authenticate_payload()',
      rippleScore: '84%',
      impactedNodes: [
        { name: 'POST /api/v1/billing/checkout', tier: 'CRITICAL', delay: '100ms', type: 'endpoint' },
        { name: 'GET /api/v1/user/profile', tier: 'HIGH', delay: '200ms', type: 'endpoint' },
        { name: 'models/user_session.py', tier: 'MEDIUM', delay: '300ms', type: 'model' },
        { name: 'tests/unit/test_auth_service.py', tier: 'TARGETED', delay: '400ms', type: 'test' },
      ],
    },
    jwt: {
      sourceFile: 'pkg/security/jwt_token.go',
      symbol: 'func ValidateTokenClaims()',
      rippleScore: '92%',
      impactedNodes: [
        { name: 'middleware/auth_guard.go', tier: 'CRITICAL', delay: '100ms', type: 'middleware' },
        { name: 'POST /api/v2/oauth/refresh', tier: 'CRITICAL', delay: '200ms', type: 'endpoint' },
        { name: 'services/rbac_policy.go', tier: 'HIGH', delay: '300ms', type: 'service' },
        { name: 'tests/e2e/test_jwt_revocation.py', tier: 'TARGETED', delay: '400ms', type: 'test' },
      ],
    },
    db: {
      sourceFile: 'database/pool_manager.ts',
      symbol: 'export function acquireClient()',
      rippleScore: '76%',
      impactedNodes: [
        { name: 'repositories/order_repository.ts', tier: 'HIGH', delay: '100ms', type: 'repo' },
        { name: 'services/inventory_sync.ts', tier: 'HIGH', delay: '200ms', type: 'service' },
        { name: 'workers/cron_reconciliation.ts', tier: 'MEDIUM', delay: '300ms', type: 'worker' },
        { name: 'tests/integration/test_db_pool.ts', tier: 'TARGETED', delay: '400ms', type: 'test' },
      ],
    },
  };

  const currentSim = simulationData[activeSimulation];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container flex flex-col relative overflow-x-hidden">
      {/* Dynamic Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-primary-container via-lime-300 to-primary-container z-[60] shadow-[0_0_14px_#B6FF2E] transition-all duration-75 ease-out pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-surface-container-high px-4 lg:px-8 h-16 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
            <RepoLensLogo size="lg" />
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-outline">
            <a href="#hero" className="hover:text-primary-container transition-colors">Home</a>
            <a href="#features" className="hover:text-primary-container transition-colors">Capabilities</a>
            <a href="#simulation" className="hover:text-primary-container transition-colors">Ripple Simulation</a>
            <a href="#ingestion" className="hover:text-primary-container transition-colors">Ingest</a>
          </nav>
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-headline-sm text-xs font-semibold transition-all shadow-glow-lime hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Console</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* Hero Section with Parallax Floating Badges */}
      <section id="hero" className="relative overflow-hidden pt-20 pb-24 px-4 lg:px-8 border-b border-surface-container-high">
        {/* Animated Background Laser & Photon Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Ambient Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Floating Parallax Cyber Badges */}
        <div className="hidden lg:flex absolute left-8 xl:left-20 top-28 items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low/90 backdrop-blur-md border border-primary-container/30 text-xs font-code shadow-lg animate-float-slow pointer-events-none z-10">
          <span className="material-symbols-outlined text-primary-container text-[18px]">account_tree</span>
          <span className="text-on-surface font-semibold">AST Engine L4 Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping" />
        </div>

        <div className="hidden lg:flex absolute right-8 xl:right-24 top-36 items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low/90 backdrop-blur-md border border-secondary/30 text-xs font-code shadow-lg animate-float-reverse pointer-events-none z-10">
          <span className="material-symbols-outlined text-secondary text-[18px]">radar</span>
          <span className="text-on-surface font-semibold">0.02s Ripple Calculation</span>
        </div>

        <div className="hidden xl:flex absolute left-16 bottom-28 items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low/90 backdrop-blur-md border border-error/30 text-xs font-code shadow-lg animate-float-reverse pointer-events-none z-10">
          <span className="material-symbols-outlined text-error text-[18px]">security</span>
          <span className="text-on-surface font-semibold">Zero False Positives Taint</span>
        </div>

        <div className="hidden xl:flex absolute right-20 bottom-24 items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low/90 backdrop-blur-md border border-primary-container/30 text-xs font-code shadow-lg animate-float-slow pointer-events-none z-10">
          <span className="material-symbols-outlined text-primary-container text-[18px]">checklist</span>
          <span className="text-on-surface font-semibold">Synthetic Test Isolation</span>
        </div>

        {/* Central Hero Content */}
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6 relative z-10">
          {/* Slogan Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-surface-container-highest text-xs font-code shadow-sm hover:border-primary-container/50 transition-colors">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="text-on-surface font-semibold">RepoLens</span>
            <span className="text-surface-variant">•</span>
            <span className="text-primary-container font-semibold tracking-wider">SEE BEYOND THE CODE</span>
          </div>

          {/* Headline */}
          <h1 className="font-headline-xl text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface max-w-4xl leading-tight">
            Understand the{' '}
            <span className="relative inline-block text-primary-container">
              Blast Radius
              <span className="absolute bottom-1 left-0 right-0 h-1 bg-primary-container/40 rounded-full" />
            </span>{' '}
            of Every Code Change
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/ingest')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-headline-sm text-sm font-semibold transition-all shadow-glow-lime hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              <span>Ingest Repository / Upload ZIP</span>
            </button>
            <button
              onClick={() => navigate('/app')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-highest text-on-surface font-headline-sm text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          {/* Telemetry Metrics Strip */}
          <div className="w-full max-w-4xl mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container-high hover:border-primary-container/40 transition-all group">
              <div className="text-primary-container font-code text-2xl font-bold tracking-tight group-hover:scale-105 transition-transform origin-left">
                400k+
              </div>
              <div className="text-xs text-outline mt-1 font-semibold">AST Nodes Analyzed / sec</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container-high hover:border-primary-container/40 transition-all group">
              <div className="text-secondary font-code text-2xl font-bold tracking-tight group-hover:scale-105 transition-transform origin-left">
                &lt; 0.02s
              </div>
              <div className="text-xs text-outline mt-1 font-semibold">Blast Ripple Latency</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container-high hover:border-primary-container/40 transition-all group">
              <div className="text-primary-container font-code text-2xl font-bold tracking-tight group-hover:scale-105 transition-transform origin-left">
                100%
              </div>
              <div className="text-xs text-outline mt-1 font-semibold">Deterministic Call Trees</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container-high hover:border-primary-container/40 transition-all group">
              <div className="text-amber-400 font-code text-2xl font-bold tracking-tight group-hover:scale-105 transition-transform origin-left">
                5x
              </div>
              <div className="text-xs text-outline mt-1 font-semibold">Faster Regression Cycles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Blast Ripple Simulator Section */}
      <section
        id="simulation"
        ref={simulationRef}
        className={`py-20 px-4 lg:px-8 border-b border-surface-container-high bg-surface-container-lowest transition-all duration-700 ${
          visibleSections['simulation'] ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-6'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="font-label-caps text-label-caps px-3 py-1 rounded-full bg-surface-container text-primary-container uppercase font-semibold">
              LIVE IMPACT SIMULATOR
            </span>
            <h2 className="font-headline-xl text-3xl sm:text-4xl font-bold text-on-surface">
              Interactive Downstream Ripple Engine
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
              Select a modified code symbol to simulate how syntactic changes propagate across API endpoints, data models, and test suites.
            </p>
          </div>

          {/* Trigger Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveSimulation('auth')}
              className={`px-4 py-2 rounded-xl text-xs font-code transition-all flex items-center gap-2 border ${
                activeSimulation === 'auth'
                  ? 'bg-primary-container text-on-primary-container font-bold border-primary-container shadow-glow-lime scale-105'
                  : 'bg-surface-container-low text-on-surface border-surface-container-highest hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>services/auth_service.py</span>
            </button>

            <button
              onClick={() => setActiveSimulation('jwt')}
              className={`px-4 py-2 rounded-xl text-xs font-code transition-all flex items-center gap-2 border ${
                activeSimulation === 'jwt'
                  ? 'bg-primary-container text-on-primary-container font-bold border-primary-container shadow-glow-lime scale-105'
                  : 'bg-surface-container-low text-on-surface border-surface-container-highest hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">lock_reset</span>
              <span>pkg/security/jwt_token.go</span>
            </button>

            <button
              onClick={() => setActiveSimulation('db')}
              className={`px-4 py-2 rounded-xl text-xs font-code transition-all flex items-center gap-2 border ${
                activeSimulation === 'db'
                  ? 'bg-primary-container text-on-primary-container font-bold border-primary-container shadow-glow-lime scale-105'
                  : 'bg-surface-container-low text-on-surface border-surface-container-highest hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">database</span>
              <span>database/pool_manager.ts</span>
            </button>
          </div>

          {/* Ripple Visualizer Console */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-surface-container-low border border-surface-container-high p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Laser Sweep Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent animate-laser-sweep" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[22px]">radar</span>
                </div>
                <div>
                  <div className="font-code text-xs text-outline">Modified Origin AST Node</div>
                  <div className="font-code text-sm font-bold text-on-surface">{currentSim.sourceFile}</div>
                  <div className="text-[11px] font-mono text-primary-container">{currentSim.symbol}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-code text-outline uppercase">Cumulative Blast Score</div>
                  <div className="text-2xl font-mono font-bold text-primary-container">{currentSim.rippleScore}</div>
                </div>
                <div className="w-3 h-3 rounded-full bg-primary-container animate-ping" />
              </div>
            </div>

            {/* Cascading Impact Nodes */}
            <div className="mt-6 space-y-3">
              <div className="text-xs font-code text-outline uppercase tracking-wider">
                Propagated Downstream Dependencies:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSim.impactedNodes.map((node, i) => (
                  <div
                    key={node.name}
                    className="p-3.5 rounded-xl bg-surface-container border border-surface-container-highest flex items-center justify-between hover:border-primary-container/40 transition-all hover:scale-[1.01]"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-primary-container" />
                      <span className="font-code text-xs text-on-surface truncate">{node.name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-code px-2 py-0.5 rounded font-bold ${
                        node.tier === 'CRITICAL'
                          ? 'bg-error/20 text-error'
                          : node.tier === 'HIGH'
                          ? 'bg-amber-400/20 text-amber-400'
                          : node.tier === 'TARGETED'
                          ? 'bg-primary-container/20 text-primary-container'
                          : 'bg-surface-container-high text-outline'
                      }`}
                    >
                      {node.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-6 pt-4 border-t border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-code text-outline">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary-container">verified</span>
                <span>Deterministic AST propagation across 12 package modules</span>
              </div>
              <button
                onClick={() => navigate('/blast-radius')}
                className="text-primary-container hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Explore in Interactive Graph</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section
        id="features"
        ref={featuresRef}
        className={`py-20 px-4 lg:px-8 border-b border-surface-container-high bg-background transition-all duration-700 ${
          visibleSections['features'] ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-6'
        }`}
      >
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
              className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-primary-container/50 hover:shadow-glow-lime/20 cursor-pointer transition-all space-y-3 group shadow-sm hover:-translate-y-1 duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
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
              className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-error/50 cursor-pointer transition-all space-y-3 group shadow-sm hover:-translate-y-1 duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center group-hover:scale-110 group-hover:bg-error group-hover:text-on-error transition-all">
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
              className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-secondary/50 cursor-pointer transition-all space-y-3 group shadow-sm hover:-translate-y-1 duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 group-hover:bg-secondary group-hover:text-on-secondary transition-all">
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
              className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-primary-container/50 hover:shadow-glow-lime/20 cursor-pointer transition-all space-y-3 group shadow-sm hover:-translate-y-1 duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
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

      {/* Ingestion Methods Banner */}
      <section
        id="ingestion"
        ref={ingestRef}
        className={`py-16 px-4 lg:px-8 border-b border-surface-container-high bg-gradient-to-b from-surface-container-low to-background transition-all duration-700 ${
          visibleSections['ingestion'] ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-6'
        }`}
      >
        <div className="max-w-4xl mx-auto rounded-2xl bg-surface-container border border-surface-container-highest p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden group">
          {/* Laser Sweep on Hover/Active */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent animate-laser-sweep" />

          <span className="font-label-caps text-label-caps px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-mono font-bold">
            ZERO FRICTION INGESTION
          </span>
          <h2 className="font-headline-xl text-3xl font-bold text-on-surface">
            Two Ways to Analyze Any Repository in Seconds
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            Paste a public or private Git repository URL with branch &amp; PAT credentials, or drag and drop a local ZIP / Tarball archive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/ingest')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-headline-sm text-sm font-semibold transition-all shadow-glow-lime hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">add_link</span>
              <span>Paste Git URL</span>
            </button>
            <button
              onClick={() => navigate('/ingest')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface font-headline-sm text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">folder_zip</span>
              <span>Upload ZIP File</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 lg:px-8 bg-surface-container-lowest border-t border-surface-container-high text-xs text-outline font-code">
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

export default LandingPage;
