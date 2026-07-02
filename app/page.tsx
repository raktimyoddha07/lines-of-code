'use client';

import * as React from 'react';
import { FolderPicker } from '@/components/folder-picker';
import { SummaryCards } from '@/components/summary-cards';
import { LanguageChart } from '@/components/language-chart';
import { FileTree } from '@/components/file-tree';
import { IgnoreListPanel } from '@/components/ignore-list-panel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FileNode, FilterMode, ScanProgress } from '@/lib/types';
import { buildTreeFromFiles } from '@/lib/build-tree';
import { aggregateTree } from '@/lib/aggregate';
import { RefreshCw, Play, BarChart2, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [flatFiles, setFlatFiles] = React.useState<FileNode[]>([]);
  const [projectName, setProjectName] = React.useState<string>('');
  const [filterMode, setFilterMode] = React.useState<FilterMode>('all');
  const [manualIgnores, setManualIgnores] = React.useState<string[]>([]);
  
  const [progress, setProgress] = React.useState<ScanProgress>({
    scannedFiles: 0,
    discoveredFiles: 0,
    status: 'idle'
  });

  const workerRef = React.useRef<Worker | null>(null);
  const nativeDirHandleRef = React.useRef<FileSystemDirectoryHandle | null>(null);
  const fallbackFilesRef = React.useRef<{ name: string; path: string; file: File }[] | null>(null);

  // Clean up worker on unmount
  React.useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const startScan = (
    dirHandle: FileSystemDirectoryHandle | null,
    fallbackFiles: { name: string; path: string; file: File }[] | null,
    name: string
  ) => {
    // Terminate existing worker if scanning
    workerRef.current?.terminate();

    // Reset states
    setFlatFiles([]);
    setProjectName(name);
    setProgress({
      scannedFiles: 0,
      discoveredFiles: 0,
      status: 'scanning',
      projectName: name
    });

    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../workers/scan-worker.ts', import.meta.url));

    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'progress') {
        setProgress(prev => ({
          ...prev,
          scannedFiles: data.scannedFiles,
          discoveredFiles: data.discoveredFiles
        }));
      } else if (type === 'batch') {
        setFlatFiles(prev => [...prev, ...data]);
      } else if (type === 'done') {
        setProgress(prev => ({ ...prev, status: 'done' }));
      } else if (type === 'error') {
        setProgress(prev => ({ ...prev, status: 'error', error: data }));
      }
    };

    if (dirHandle) {
      nativeDirHandleRef.current = dirHandle;
      fallbackFilesRef.current = null;
      workerRef.current.postMessage({ type: 'scan-native', data: { dirHandle } });
    } else if (fallbackFiles) {
      nativeDirHandleRef.current = null;
      fallbackFilesRef.current = fallbackFiles;
      workerRef.current.postMessage({ type: 'scan-fallback', data: { files: fallbackFiles } });
    }
  };

  const handleReScan = () => {
    if (nativeDirHandleRef.current) {
      startScan(nativeDirHandleRef.current, null, projectName);
    } else if (fallbackFilesRef.current) {
      startScan(null, fallbackFilesRef.current, projectName);
    }
  };

  const handleAddIgnore = (pattern: string) => {
    setManualIgnores(prev => [...prev, pattern]);
  };

  const handleRemoveIgnore = (pattern: string) => {
    setManualIgnores(prev => prev.filter(p => p !== pattern));
  };

  const handleToggleIgnorePath = (path: string) => {
    setManualIgnores(prev => {
      if (prev.includes(path)) {
        return prev.filter(p => p !== path);
      } else {
        return [...prev, path];
      }
    });
  };

  // Re-build standard folder tree memoized when files list updates
  const rootNode = React.useMemo(() => {
    return buildTreeFromFiles(flatFiles, projectName);
  }, [flatFiles, projectName]);

  // Aggregated results matching the current ignore lists and filter modes
  const aggregated = React.useMemo(() => {
    return aggregateTree(rootNode, filterMode, manualIgnores);
  }, [rootNode, filterMode, manualIgnores]);

  const isScanning = progress.status === 'scanning';
  const hasData = flatFiles.length > 0;

  return (
    <main className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-slate-400 bg-clip-text text-transparent">
              Lines of Code
            </h1>
            <p className="text-sm text-muted-foreground">
              A private, client-side repository line-counting and analytics dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <FolderPicker
              onFolderSelected={(handle, name) => startScan(handle, null, name)}
              onFallbackSelected={(files, name) => startScan(null, files, name)}
              disabled={isScanning}
            />
            {hasData && (
              <Button
                variant="outline"
                onClick={handleReScan}
                disabled={isScanning}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                Re-scan
              </Button>
            )}
          </div>
        </header>

        {/* Loading Progress State */}
        {isScanning && (
          <div className="border border-primary/20 bg-muted/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">Scanning repository files...</span>
              <span className="text-muted-foreground font-mono">
                {progress.scannedFiles} / {progress.discoveredFiles} files processed
              </span>
            </div>
            <Progress value={progress.discoveredFiles > 0 ? (progress.scannedFiles / progress.discoveredFiles) * 100 : 0} />
          </div>
        )}

        {/* Error Notification */}
        {progress.status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 border border-red-950/50 bg-red-950/20 p-4 rounded-xl text-sm">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Scanning failed: {progress.error}</span>
          </div>
        )}

        {/* Empty Landing View */}
        {!hasData && !isScanning && (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-2xl bg-muted/5 min-h-[40vh] space-y-6">
            <div className="p-4 rounded-full bg-muted/10 border border-border">
              <BarChart2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-bold tracking-tight">No Folder Selected</h2>
              <p className="text-sm text-muted-foreground">
                To start, click the button above to pick a project folder from your local machine. All processing happens locally in your browser.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {hasData && (
          <div className="space-y-6">
            
            {/* Filter Tabs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/10 border p-2 rounded-xl">
              <span className="text-sm font-bold text-muted-foreground px-2">
                Project: <code className="text-primary">{projectName}</code>
              </span>
              <Tabs
                value={filterMode}
                onValueChange={(val) => setFilterMode(val as FilterMode)}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">All Lines</TabsTrigger>
                  <TabsTrigger value="excludeBlank">No Blanks</TabsTrigger>
                  <TabsTrigger value="excludeComments">No Comments</TabsTrigger>
                  <TabsTrigger value="excludeBoth">Code Only</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Stats Row */}
            <SummaryCards
              totalLines={aggregated.totalLines}
              totalFiles={aggregated.totalFiles}
              totalFolders={aggregated.totalFolders}
              totalLanguages={aggregated.languageStats.length}
            />

            {/* Visual Charts & Split Screen Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main tree & language list */}
              <div className="lg:col-span-2 space-y-6">
                {/* Language Breakdown */}
                <div className="border rounded-xl p-6 bg-muted/10">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Language Composition
                  </h3>
                  <LanguageChart languageStats={aggregated.languageStats} filterMode={filterMode} />
                </div>

                {/* File Tree */}
                <FileTree
                  rootNode={aggregated.tree}
                  filterMode={filterMode}
                  onToggleIgnore={handleToggleIgnorePath}
                />
              </div>

              {/* Sidebar configuration (Ignores) */}
              <div className="space-y-6">
                <IgnoreListPanel
                  ignoreList={manualIgnores}
                  onAddIgnore={handleAddIgnore}
                  onRemoveIgnore={handleRemoveIgnore}
                />
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
