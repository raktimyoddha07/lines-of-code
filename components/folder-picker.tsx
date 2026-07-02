'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { FolderOpen, AlertTriangle } from 'lucide-react';
import { isDefaultFolderIgnored, isDefaultFileIgnored } from '@/lib/ignore-match';

type FolderPickerProps = {
  onFolderSelected: (dirHandle: FileSystemDirectoryHandle, name: string) => void;
  onFallbackSelected: (files: { name: string; path: string; file: File }[], name: string) => void;
  disabled?: boolean;
};

export function FolderPicker({ onFolderSelected, onFallbackSelected, disabled }: FolderPickerProps) {
  const [hasNativeSupport, setHasNativeSupport] = React.useState<boolean>(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setHasNativeSupport(typeof window !== 'undefined' && 'showDirectoryPicker' in window);
  }, []);

  const handleNativeClick = async () => {
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read'
      });
      onFolderSelected(dirHandle, dirHandle.name);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error opening directory picker:', err);
      }
    }
  };

  const handleFallbackClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Convert FileList to our expected array shape and filter out default ignored paths before sending
    const rawFiles = Array.from(fileList);
    const projectName = rawFiles[0]?.webkitRelativePath.split('/')[0] || 'Project';

    const processedFiles: { name: string; path: string; file: File }[] = [];

    for (const file of rawFiles) {
      // webkitRelativePath starts with the root folder name, e.g. "my-project/src/index.js".
      // We want paths relative to the project root, so we strip the root folder name.
      const pathParts = file.webkitRelativePath.split('/');
      const relativePath = pathParts.slice(1).join('/');

      if (!relativePath) continue;

      // Filter default ignores on main thread to prevent passing ignored files to worker
      if (isDefaultFolderIgnored(relativePath) || isDefaultFileIgnored(relativePath)) {
        continue;
      }

      processedFiles.push({
        name: file.name,
        path: relativePath,
        file: file
      });
    }

    onFallbackSelected(processedFiles, projectName);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {hasNativeSupport ? (
          <Button
            onClick={handleNativeClick}
            disabled={disabled}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Select Folder
          </Button>
        ) : (
          <div>
            <Button
              onClick={handleFallbackClick}
              disabled={disabled}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Select Folder (Fallback Mode)
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
            />
          </div>
        )}
      </div>

      {!hasNativeSupport && (
        <div className="flex items-center gap-1.5 text-amber-400 text-xs mt-1 bg-amber-950/20 border border-amber-900/50 rounded-md p-2 max-w-md">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Your browser does not support the File System Access API. Fallback mode is active. (Files will be loaded via file upload input).
          </span>
        </div>
      )}
    </div>
  );
}
