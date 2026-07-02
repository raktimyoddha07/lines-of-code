import { FileNode, FolderNode, LanguageStat, FilterMode } from './types';
import { isManuallyIgnored } from './ignore-match';

/**
 * Returns the line count of a file node based on the active filter mode.
 */
export function getFileLineCount(file: FileNode, filterMode: FilterMode): number {
  if (file.binary) return 0;
  switch (filterMode) {
    case 'excludeBlank':
      return file.totalLines - file.blankLines;
    case 'excludeComments':
      return file.totalLines - file.commentLines;
    case 'excludeBoth':
      return file.codeLines;
    case 'all':
    default:
      return file.totalLines;
  }
}

export type AggregationResult = {
  tree: FolderNode;
  totalLines: number;
  totalFiles: number;
  totalFolders: number;
  languageStats: LanguageStat[];
};

/**
 * Recursively applies manual ignore patterns and computes bottom-up aggregates.
 */
export function aggregateTree(
  root: FolderNode,
  filterMode: FilterMode,
  manualIgnores: string[]
): AggregationResult {
  const langMap: Record<string, LanguageStat> = {};
  let totalFiles = 0;
  let totalFolders = 0;

  function processNode(node: FileNode | FolderNode, parentIgnored: boolean): FileNode | FolderNode {
    const isIgnored = parentIgnored || isManuallyIgnored(node.path, manualIgnores);

    if (node.type === 'file') {
      const updatedFile: FileNode = {
        ...node,
        ignored: isIgnored,
      };

      if (!isIgnored) {
        totalFiles++;
        if (!updatedFile.binary) {
          const lang = updatedFile.language;
          if (!langMap[lang]) {
            langMap[lang] = {
              language: lang,
              files: 0,
              totalLines: 0,
              blankLines: 0,
              commentLines: 0,
              codeLines: 0,
            };
          }
          langMap[lang].files++;
          langMap[lang].totalLines += updatedFile.totalLines;
          langMap[lang].blankLines += updatedFile.blankLines;
          langMap[lang].commentLines += updatedFile.commentLines;
          langMap[lang].codeLines += updatedFile.codeLines;
        }
      }

      return updatedFile;
    } else {
      // It's a folder
      if (!isIgnored) {
        totalFolders++;
      }

      const updatedChildren = node.children.map(child => processNode(child, isIgnored));

      // Sum stats bottom-up from non-ignored children only
      let folderTotal = 0;
      let folderBlank = 0;
      let folderComment = 0;
      let folderCode = 0;

      for (const child of updatedChildren) {
        if (child.ignored) continue;

        if (child.type === 'file') {
          if (!child.binary) {
            folderTotal += child.totalLines;
            folderBlank += child.blankLines;
            folderComment += child.commentLines;
            folderCode += child.codeLines;
          }
        } else {
          folderTotal += child.totalLines;
          folderBlank += child.blankLines;
          folderComment += child.commentLines;
          folderCode += child.codeLines;
        }
      }

      return {
        type: 'folder',
        name: node.name,
        path: node.path,
        children: updatedChildren,
        totalLines: folderTotal,
        blankLines: folderBlank,
        commentLines: folderComment,
        codeLines: folderCode,
      } as FolderNode;
    }
  }

  const processedTree = processNode(root, false) as FolderNode;

  // Derive total lines according to filter
  let totalLinesFiltered = 0;
  if (filterMode === 'all') {
    totalLinesFiltered = processedTree.totalLines;
  } else if (filterMode === 'excludeBlank') {
    totalLinesFiltered = processedTree.totalLines - processedTree.blankLines;
  } else if (filterMode === 'excludeComments') {
    totalLinesFiltered = processedTree.totalLines - processedTree.commentLines;
  } else if (filterMode === 'excludeBoth') {
    totalLinesFiltered = processedTree.codeLines;
  }

  // Sort language stats by line count descending
  const languageStats = Object.values(langMap).sort((a, b) => {
    const aVal = filterMode === 'all' ? a.totalLines : filterMode === 'excludeBlank' ? a.totalLines - a.blankLines : filterMode === 'excludeComments' ? a.totalLines - a.commentLines : a.codeLines;
    const bVal = filterMode === 'all' ? b.totalLines : filterMode === 'excludeBlank' ? b.totalLines - b.blankLines : filterMode === 'excludeComments' ? b.totalLines - b.commentLines : b.codeLines;
    return bVal - aVal;
  });

  return {
    tree: processedTree,
    totalLines: totalLinesFiltered,
    totalFiles,
    totalFolders,
    languageStats,
  };
}
