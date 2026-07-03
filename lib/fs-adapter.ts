export interface ScannedFile {
  path: string;
  name: string;
  sizeBytes: number;
  readText(): Promise<string>;
}

export interface FsAdapter {
  pickRootFolder(): Promise<{ rootName: string } | null>;
  listFiles(shouldSkipDir: (dirName: string, relPath: string) => boolean): Promise<ScannedFile[]>;
}

export function isDesktop(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
