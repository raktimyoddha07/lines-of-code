import { isDefaultFolderIgnored, isDefaultFileIgnored } from './ignore-match';
import type { FsAdapter, ScannedFile } from './fs-adapter';

export const webFsAdapter: FsAdapter = {
  async pickRootFolder() {
    const hasNativeSupport = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
    
    if (hasNativeSupport) {
      try {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        webDirHandle = dirHandle;
        return { rootName: dirHandle.name };
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        throw err;
      }
    } else {
      // Fallback mode - trigger file input
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        // @ts-ignore
        input.webkitdirectory = true;
        // @ts-ignore
        input.directory = true;
        input.multiple = true;
        
        input.onchange = (e) => {
          const fileList = (e.target as HTMLInputElement).files;
          if (!fileList || fileList.length === 0) {
            resolve(null);
            return;
          }
          
          webFallbackFiles = Array.from(fileList);
          const projectName = webFallbackFiles[0]?.webkitRelativePath.split('/')[0] || 'Project';
          resolve({ rootName: projectName });
        };
        
        input.oncancel = () => resolve(null);
        input.click();
      });
    }
  },

  async listFiles(shouldSkipDir) {
    const results: ScannedFile[] = [];
    
    if (webDirHandle) {
      // Native File System Access API
      async function walk(handle: FileSystemDirectoryHandle, relPath: string) {
        // @ts-ignore
        for await (const [name, entry] of handle.entries()) {
          const entryRel = relPath ? `${relPath}/${name}` : name;
          
          if (entry.kind === 'directory') {
            if (shouldSkipDir(name, entryRel)) continue;
            await walk(entry as FileSystemDirectoryHandle, entryRel);
          } else {
            const file = await (entry as FileSystemFileHandle).getFile();
            results.push({
              path: entryRel,
              name: name,
              sizeBytes: file.size,
              readText: () => file.text(),
            });
          }
        }
      }
      await walk(webDirHandle, '');
    } else if (webFallbackFiles) {
      // Fallback mode with FileList
      for (const file of webFallbackFiles) {
        const pathParts = file.webkitRelativePath.split('/');
        const relativePath = pathParts.slice(1).join('/');
        
        if (!relativePath) continue;
        if (isDefaultFolderIgnored(relativePath) || isDefaultFileIgnored(relativePath)) {
          continue;
        }
        
        results.push({
          path: relativePath,
          name: file.name,
          sizeBytes: file.size,
          readText: () => file.text(),
        });
      }
    }
    
    return results;
  },
};

let webDirHandle: FileSystemDirectoryHandle | null = null;
let webFallbackFiles: File[] | null = null;
