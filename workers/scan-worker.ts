import { countLines, isBinaryContent } from '../lib/count-lines';
import { getLanguageForExtension } from '../lib/languages';
import { isDefaultFolderIgnored, isDefaultFileIgnored } from '../lib/ignore-match';
import { FileNode } from '../lib/types';

const ctx: Worker = self as any;

ctx.onmessage = async (e: MessageEvent) => {
  const { type, data } = e.data;

  if (type === 'scan-native') {
    try {
      const { dirHandle } = data;
      let scannedFiles = 0;
      let discoveredFiles = 0;

      const fileQueue: { handle: FileSystemFileHandle; path: string }[] = [];

      async function discover(directory: FileSystemDirectoryHandle, currentPath: string) {
        for await (const [name, handle] of (directory as any).entries()) {
          const relativePath = currentPath ? `${currentPath}/${name}` : name;

          if (isDefaultFolderIgnored(relativePath)) {
            continue;
          }

          if (handle.kind === 'directory') {
            await discover(handle, relativePath);
          } else if (handle.kind === 'file') {
            if (isDefaultFileIgnored(relativePath)) {
              continue;
            }
            discoveredFiles++;
            fileQueue.push({ handle, path: relativePath });

            if (discoveredFiles % 50 === 0) {
              ctx.postMessage({
                type: 'progress',
                data: { scannedFiles, discoveredFiles }
              });
            }
          }
        }
      }

      await discover(dirHandle, '');

      ctx.postMessage({
        type: 'progress',
        data: { scannedFiles, discoveredFiles }
      });

      const batchSize = 25;
      let batch: FileNode[] = [];

      for (const item of fileQueue) {
        try {
          const file = await item.handle.getFile();
          const fileNode = await processFile(file, item.path);
          batch.push(fileNode);
          scannedFiles++;

          if (batch.length >= batchSize) {
            ctx.postMessage({ type: 'batch', data: batch });
            ctx.postMessage({ type: 'progress', data: { scannedFiles, discoveredFiles } });
            batch = [];
          }
        } catch (err) {
          console.error(`Failed to read file ${item.path}:`, err);
        }
      }

      if (batch.length > 0) {
        ctx.postMessage({ type: 'batch', data: batch });
      }
      ctx.postMessage({ type: 'progress', data: { scannedFiles, discoveredFiles } });
      ctx.postMessage({ type: 'done' });

    } catch (err: any) {
      ctx.postMessage({ type: 'error', data: err.message || String(err) });
    }
  } else if (type === 'scan-fallback') {
    try {
      const { files } = data; // Array of { name: string, path: string, file: File }
      let scannedFiles = 0;
      const discoveredFiles = files.length;

      ctx.postMessage({
        type: 'progress',
        data: { scannedFiles, discoveredFiles }
      });

      const batchSize = 25;
      let batch: FileNode[] = [];

      for (const fileObj of files) {
        try {
          const fileNode = await processFile(fileObj.file, fileObj.path);
          batch.push(fileNode);
          scannedFiles++;

          if (batch.length >= batchSize) {
            ctx.postMessage({ type: 'batch', data: batch });
            ctx.postMessage({ type: 'progress', data: { scannedFiles, discoveredFiles } });
            batch = [];
          }
        } catch (err) {
          console.error(`Failed to read file ${fileObj.path}:`, err);
        }
      }

      if (batch.length > 0) {
        ctx.postMessage({ type: 'batch', data: batch });
      }
      ctx.postMessage({ type: 'progress', data: { scannedFiles, discoveredFiles } });
      ctx.postMessage({ type: 'done' });

    } catch (err: any) {
      ctx.postMessage({ type: 'error', data: err.message || String(err) });
    }
  }
};

async function processFile(file: File, relativePath: string): Promise<FileNode> {
  const text = await file.text();
  const isBin = isBinaryContent(text);
  const ext = relativePath.split('.').pop() || '';
  const langConfig = getLanguageForExtension(ext);

  if (isBin) {
    return {
      type: 'file',
      name: file.name,
      path: relativePath,
      language: 'Binary',
      totalLines: 0,
      blankLines: 0,
      commentLines: 0,
      codeLines: 0,
      sizeBytes: file.size,
      ignored: false,
      binary: true
    };
  }

  const stats = countLines(text, langConfig);
  return {
    type: 'file',
    name: file.name,
    path: relativePath,
    language: langConfig.label,
    totalLines: stats.totalLines,
    blankLines: stats.blankLines,
    commentLines: stats.commentLines,
    codeLines: stats.codeLines,
    sizeBytes: file.size,
    ignored: false,
    binary: false
  };
}
