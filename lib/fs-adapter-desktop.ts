import { open } from '@tauri-apps/plugin-dialog';
import { readDir, readTextFile, stat } from '@tauri-apps/plugin-fs';
import type { FsAdapter, ScannedFile } from './fs-adapter';

export const desktopFsAdapter: FsAdapter = {
  async pickRootFolder() {
    const selected = await open({ directory: true, multiple: false });
    if (!selected) return null;
    rootPath = selected as string;
    return { rootName: rootPath.split(/[\\/]/).pop() ?? rootPath };
  },

  async listFiles(shouldSkipDir) {
    const results: ScannedFile[] = [];
    async function walk(absPath: string, relPath: string) {
      const entries = await readDir(absPath);
      for (const entry of entries) {
        const entryRel = relPath ? `${relPath}/${entry.name}` : entry.name;
        // @ts-ignore
        if (entry.isDirectory) {
          if (shouldSkipDir(entry.name, entryRel)) continue;
          await walk(`${absPath}/${entry.name}`, entryRel);
        } else {
          const info = await stat(`${absPath}/${entry.name}`);
          results.push({
            path: entryRel,
            name: entry.name,
            sizeBytes: info.size,
            readText: () => readTextFile(`${absPath}/${entry.name}`),
          });
        }
      }
    }
    await walk(rootPath, '');
    return results;
  },
};

let rootPath = '';
