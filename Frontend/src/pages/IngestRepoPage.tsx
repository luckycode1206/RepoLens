import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { repoService } from '../services/api';

export const IngestRepoPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshRepositories, setActiveRepoId } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<'url' | 'zip'>('url');

  // URL Tab State
  const [gitHost, setGitHost] = useState<'github' | 'gitlab' | 'bitbucket' | 'custom'>('github');
  const [repoUrl, setRepoUrl] = useState('https://github.com/repolens-org/payments-core.git');
  const [repoName, setRepoName] = useState('payments-core');
  const [branch, setBranch] = useState('main');
  const [token, setToken] = useState('ghp_920f8ab73ce184209fa29c');

  // ZIP Tab State
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>({
    name: 'analytics-worker-v2.1.zip',
    size: '14.2 MB',
  });
  const [zipRepoAlias, setZipRepoAlias] = useState('analytics-worker');
  const [zipBranch, setZipBranch] = useState('main');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scan Depth State
  const [depth, setDepth] = useState<'l1' | 'l3' | 'l4'>('l3');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setSelectedMethod('zip');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
      const cleanName = file.name.replace(/\.(zip|tar\.gz|tar|tgz)$/i, '');
      setZipRepoAlias(cleanName);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMethod('zip');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
      const cleanName = file.name.replace(/\.(zip|tar\.gz|tar|tgz)$/i, '');
      setZipRepoAlias(cleanName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isUrl = selectedMethod === 'url';
    const name = isUrl ? repoName || 'new-repo' : zipRepoAlias || 'uploaded-archive';
    const targetBranch = isUrl ? branch : zipBranch;

    const created = await repoService.createRepository({
      name,
      branch: targetBranch || 'main',
      language: isUrl ? 'TypeScript / Node' : 'Python 3.11',
      framework: isUrl ? 'FastAPI / NestJS' : 'Flask / Celery',
      scanDepth: depth === 'l3' ? 'L3 AST' : depth === 'l4' ? 'Full Monorepo' : 'L1 Static',
    });

    await refreshRepositories();
    setActiveRepoId(created.id);
    navigate('/progress');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-space-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              Ingest Repository
            </h1>
            <span className="font-label-caps text-label-caps px-space-xs py-space-2xs rounded bg-surface-container text-primary-container font-mono">
              AST INGESTION WORKSTATION
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Provide a remote Git repository URL or upload a local ZIP / Tarball archive for instant topological parsing.
          </p>
        </div>

        <button
          onClick={() => navigate('/repositories')}
          className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container border border-surface-container-highest text-outline hover:text-on-surface transition-colors self-start sm:self-auto flex items-center gap-1.5 text-xs font-code"
        >
          <span className="material-symbols-outlined text-[16px]">folder_data</span>
          <span>View Fleet</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-space-lg">
        {/* Unified Single Frame with Upper Git Repository, OR Divider, and Lower ZIP Archive */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-4 sm:p-6 space-y-6 shadow-sm">
          {/* Policy Notice Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-xl bg-surface-container border border-surface-container-highest text-xs font-code">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
              <span>Single Ingestion Policy: Choose either <strong>Remote Git Repository</strong> OR <strong>Local ZIP File</strong> (only one allowed)</span>
            </div>
            <span className="font-semibold text-primary-container flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span>{selectedMethod === 'url' ? 'Selected: Remote Git' : 'Selected: ZIP Archive'}</span>
            </span>
          </div>

          {/* UPPER SIDE: Remote Git Repository */}
          <div
            onClick={() => setSelectedMethod('url')}
            className={`rounded-xl border transition-all p-4 sm:p-6 space-y-4 ${
              selectedMethod === 'url'
                ? 'bg-surface-container/60 border-primary-container ring-1 ring-primary-container/80 shadow-sm'
                : 'bg-surface-container-lowest/40 border-surface-container-highest opacity-60 hover:opacity-90 cursor-pointer'
            }`}
          >
            {/* Upper Header Selector */}
            <div className="flex items-center justify-between gap-2 border-b border-surface-container-high/60 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${selectedMethod === 'url' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-outline'}`}>
                  <span className="material-symbols-outlined text-[20px]">add_link</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
                    <span>Upper: Remote Git Repository</span>
                  </h2>
                  <p className="text-xs text-outline">Clone directly from GitHub, GitLab, Bitbucket, or custom Git endpoint</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-code font-semibold px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                  selectedMethod === 'url'
                    ? 'bg-primary-container text-on-primary-container shadow-glow-lime'
                    : 'bg-surface-container text-outline border border-surface-container-highest'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {selectedMethod === 'url' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>{selectedMethod === 'url' ? 'ACTIVE' : 'SELECT'}</span>
                </span>
              </div>
            </div>

            {/* Git Host Quick Selector */}
            <div className="space-y-2">
              <label className="font-body-sm text-xs text-on-surface font-medium">
                Target Git Host
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                {[
                  { id: 'github', name: 'GitHub', icon: 'deployed_code' },
                  { id: 'gitlab', name: 'GitLab', icon: 'merge' },
                  { id: 'bitbucket', name: 'Bitbucket', icon: 'source' },
                  { id: 'custom', name: 'Custom Git', icon: 'terminal' },
                ].map((g) => {
                  const isSelected = gitHost === g.id && selectedMethod === 'url';
                  return (
                    <div
                      key={g.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMethod('url');
                        setGitHost(g.id as any);
                      }}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-surface-container border-primary-container ring-1 ring-primary-container'
                          : 'bg-surface-container-lowest border-surface-container-highest hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-primary-container' : 'text-outline'}`}>
                          {g.icon}
                        </span>
                        <span className="font-headline-sm text-xs font-semibold text-on-surface">
                          {g.name}
                        </span>
                      </div>
                      <span className={`material-symbols-outlined text-[14px] ${isSelected ? 'text-primary-container' : 'text-outline opacity-20'}`}>
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* URL & Credentials Form */}
            <div className="space-y-space-sm">
              <div className="space-y-1">
                <label className="font-body-sm text-xs text-on-surface font-medium">
                  Git Clone URL (HTTPS or SSH)
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onFocus={() => setSelectedMethod('url')}
                  onChange={(e) => {
                    setSelectedMethod('url');
                    setRepoUrl(e.target.value);
                    const parts = e.target.value.split('/');
                    const end = parts[parts.length - 1]?.replace('.git', '');
                    if (end) setRepoName(end);
                  }}
                  placeholder="https://github.com/organization/repository.git"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface font-code text-xs focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <div className="space-y-1">
                  <label className="font-body-sm text-xs text-on-surface font-medium">
                    Workspace Repository Alias
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onFocus={() => setSelectedMethod('url')}
                    onChange={(e) => {
                      setSelectedMethod('url');
                      setRepoName(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface font-code text-xs focus:outline-none focus:border-primary-container transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-body-sm text-xs text-on-surface font-medium">
                    Target Analysis Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onFocus={() => setSelectedMethod('url')}
                    onChange={(e) => {
                      setSelectedMethod('url');
                      setBranch(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface font-code text-xs focus:outline-none focus:border-primary-container transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-body-sm text-xs text-on-surface font-medium">
                  Personal Access Token (PAT) — Optional for Public, Required for Private
                </label>
                <input
                  type="password"
                  value={token}
                  onFocus={() => setSelectedMethod('url')}
                  onChange={(e) => {
                    setSelectedMethod('url');
                    setToken(e.target.value);
                  }}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface font-code text-xs focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>
            </div>
          </div>

          {/* THE "OR" DIVIDER */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-surface-container-highest w-full" />
            <div className="absolute px-5 py-1 bg-surface-container-low border border-surface-container-highest rounded-full shadow-md flex items-center gap-2 text-xs font-code font-bold tracking-widest text-on-surface uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
              <span className="text-primary-container font-extrabold">OR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            </div>
          </div>

          {/* LOWER SIDE: Local ZIP / Archive File */}
          <div
            onClick={() => setSelectedMethod('zip')}
            className={`rounded-xl border transition-all p-4 sm:p-6 space-y-4 ${
              selectedMethod === 'zip'
                ? 'bg-surface-container/60 border-primary-container ring-1 ring-primary-container/80 shadow-sm'
                : 'bg-surface-container-lowest/40 border-surface-container-highest opacity-60 hover:opacity-90 cursor-pointer'
            }`}
          >
            {/* Lower Header Selector */}
            <div className="flex items-center justify-between gap-2 border-b border-surface-container-high/60 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${selectedMethod === 'zip' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-outline'}`}>
                  <span className="material-symbols-outlined text-[20px]">folder_zip</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-sm sm:text-base font-bold text-on-surface flex items-center gap-2">
                    <span>Lower: Local ZIP / Codebase Archive</span>
                  </h2>
                  <p className="text-xs text-outline">Drag &amp; drop or upload a .zip, .tar.gz, or .tar codebase archive (up to 250 MB)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-code font-semibold px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                  selectedMethod === 'zip'
                    ? 'bg-primary-container text-on-primary-container shadow-glow-lime'
                    : 'bg-surface-container text-outline border border-surface-container-highest'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {selectedMethod === 'zip' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>{selectedMethod === 'zip' ? 'ACTIVE' : 'SELECT'}</span>
                </span>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMethod('zip');
                fileInputRef.current?.click();
              }}
              className={`p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 ${
                dragActive
                  ? 'border-primary-container bg-primary-container/10 ring-2 ring-primary-container'
                  : selectedMethod === 'zip'
                  ? 'border-primary-container/60 bg-surface-container-lowest hover:bg-surface-container'
                  : 'border-surface-container-highest bg-surface-container-lowest/50 hover:border-primary-container/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.tar.gz,.tar,.tgz"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary-container shadow-inner">
                <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
              </div>

              <div className="space-y-1">
                <div className="font-headline-sm text-sm font-bold text-on-surface">
                  Drag and drop your repository archive here, or <span className="text-primary-container underline">browse files</span>
                </div>
                <p className="text-xs text-outline font-body-sm">
                  Accepts zipped Git repositories or export tarballs. AST engine will extract syntax trees directly in memory.
                </p>
              </div>
            </div>

            {/* Uploaded File Confirmation Card */}
            {uploadedFile && (
              <div className="p-3.5 rounded-lg bg-surface-container border border-surface-container-highest flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-code text-xs font-semibold text-on-surface truncate">
                      {uploadedFile.name}
                    </span>
                    <span className="text-[11px] text-outline font-code">
                      Archive size: {uploadedFile.size} • Verified archive structure
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 rounded text-outline hover:text-error transition-colors"
                  title="Remove file"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            )}

            {/* Archive Metadata Alias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-1">
              <div className="space-y-1">
                <label className="font-body-sm text-xs text-on-surface font-medium">
                  Workspace Repository Alias
                </label>
                <input
                  type="text"
                  value={zipRepoAlias}
                  onFocus={() => setSelectedMethod('zip')}
                  onChange={(e) => {
                    setSelectedMethod('zip');
                    setZipRepoAlias(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface font-code text-xs focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-body-sm text-xs text-on-surface font-medium">
                  Virtual Branch Tag
                </label>
                <input
                  type="text"
                  value={zipBranch}
                  onFocus={() => setSelectedMethod('zip')}
                  onChange={(e) => {
                    setSelectedMethod('zip');
                    setZipBranch(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface font-code text-xs focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scan Depth Selection */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-space-lg space-y-space-md shadow-sm">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              psychology
            </span>
            Analysis Depth &amp; Resolution
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {[
              {
                id: 'l1',
                title: 'L1 Static AST',
                time: '~30s initial scan',
                desc: 'Fast lexical and syntactic parsing. Maps exports, function signatures, and simple imports.',
              },
              {
                id: 'l3',
                title: 'L3 Deep Trace (Recommended)',
                time: '~2m initial scan',
                desc: 'Full semantic symbol graph, cross-module blast radius vectors, and CWE taint vulnerability flow.',
              },
              {
                id: 'l4',
                title: 'L4 Monorepo Complete',
                time: '~5m initial scan',
                desc: 'Exhaustive cross-package inter-dependency resolution with circular reference detection.',
              },
            ].map((d) => {
              const isSelected = depth === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setDepth(d.id as any)}
                  className={`p-space-md rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-surface-container border-primary-container ring-1 ring-primary-container'
                      : 'bg-surface-container-lowest border-surface-container-highest hover:bg-surface-container-high'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-body-sm font-semibold text-on-surface">
                        {d.title}
                      </span>
                      <span className={`material-symbols-outlined text-[16px] ${isSelected ? 'text-primary-container' : 'text-outline opacity-20'}`}>
                        {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <div className="font-code text-[10px] text-primary-container font-semibold mt-1">
                      {d.time}
                    </div>
                    <p className="font-body-sm text-xs text-outline mt-2">
                      {d.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-space-sm pt-space-sm">
          <button
            type="button"
            onClick={() => navigate('/repositories')}
            className="px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-sm text-body-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (selectedMethod === 'url' && !repoUrl.trim()) ||
              (selectedMethod === 'zip' && !uploadedFile)
            }
            className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-headline-sm text-body-sm font-semibold transition-all shadow-glow-lime disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Initializing Pipeline...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>
                  {selectedMethod === 'url'
                    ? 'Initialize Pipeline (Remote Git)'
                    : 'Initialize Pipeline (ZIP Archive)'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
