import { FileNode, FolderNode } from './types';

/**
 * Builds a FolderNode tree from a flat list of FileNode objects.
 */
export function buildTreeFromFiles(files: FileNode[], projectName: string = 'root'): FolderNode {
  const root: FolderNode = {
    type: 'folder',
    name: projectName,
    path: '',
    children: [],
    totalLines: 0,
    blankLines: 0,
    commentLines: 0,
    codeLines: 0,
  };

  for (const file of files) {
    const parts = file.path.split('/');
    let currentFolder = root;

    // Traverse or create folders up to the parent directory of the file
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      const folderPath = parts.slice(0, i + 1).join('/');

      let childFolder = currentFolder.children.find(
        child => child.type === 'folder' && child.name === folderName
      ) as FolderNode | undefined;

      if (!childFolder) {
        childFolder = {
          type: 'folder',
          name: folderName,
          path: folderPath,
          children: [],
          totalLines: 0,
          blankLines: 0,
          commentLines: 0,
          codeLines: 0,
        };
        currentFolder.children.push(childFolder);
      }

      currentFolder = childFolder;
    }

    // Add the file node to its immediate parent directory
    currentFolder.children.push(file);
  }

  // Helper to sort folder contents: directories first (alphabetical), then files (alphabetical)
  function sortTree(node: FolderNode) {
    node.children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    for (const child of node.children) {
      if (child.type === 'folder') {
        sortTree(child);
      }
    }
  }

  sortTree(root);
  return root;
}
