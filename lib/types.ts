export type FileNode = {
  type: 'file';
  name: string;
  path: string;           // relative to project root
  language: string;       // resolved language label, or 'Other'
  totalLines: number;
  blankLines: number;
  commentLines: number;
  codeLines: number;      // totalLines - blankLines - commentLines
  sizeBytes: number;
  ignored: boolean;       // true if matched by manual ignore rule
  binary: boolean;        // true if detected as binary/skipped
};

export type FolderNode = {
  type: 'folder';
  name: string;
  path: string;
  children: (FileNode | FolderNode)[];
  // aggregated stats, computed bottom-up:
  totalLines: number;
  blankLines: number;
  commentLines: number;
  codeLines: number;
};

export type LanguageStat = {
  language: string;
  files: number;
  totalLines: number;
  blankLines: number;
  commentLines: number;
  codeLines: number;
};

export type FilterMode = 'all' | 'excludeBlank' | 'excludeComments' | 'excludeBoth';

export type ScanProgress = {
  scannedFiles: number;
  discoveredFiles: number;
  status: 'idle' | 'scanning' | 'done' | 'error';
  error?: string;
  projectName?: string;
};
