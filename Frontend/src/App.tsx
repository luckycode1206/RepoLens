import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { ConnectRepoPage } from './pages/ConnectRepoPage';
import { PipelineTelemetryPage } from './pages/PipelineTelemetryPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SecurityAnalysisPage } from './pages/SecurityAnalysisPage';
import { DependenciesPage } from './pages/DependenciesPage';
import { BlastRadiusPage } from './pages/BlastRadiusPage';
import { IssuesPage } from './pages/IssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { TestingPage } from './pages/TestingPage';
import { FileExplorerPage } from './pages/FileExplorerPage';
import { FileDetailPage } from './pages/FileDetailPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="repositories" element={<RepositoriesPage />} />
            <Route path="repositories/connect" element={<ConnectRepoPage />} />
            <Route path="progress" element={<PipelineTelemetryPage />} />
            <Route path="architecture" element={<ArchitecturePage />} />
            <Route path="security" element={<SecurityAnalysisPage />} />
            <Route path="dependencies" element={<DependenciesPage />} />
            <Route path="blast-radius" element={<BlastRadiusPage />} />
            <Route path="issues" element={<IssuesPage />} />
            <Route path="issues/:issueId" element={<IssueDetailPage />} />
            <Route path="testing" element={<TestingPage />} />
            <Route path="file-explorer" element={<FileExplorerPage />} />
            <Route path="file-explorer/detail" element={<FileDetailPage />} />
            <Route path="ai-assistant" element={<AiAssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
