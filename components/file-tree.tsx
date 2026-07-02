'use client';

import * as React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { FileNode, FolderNode, FilterMode } from '@/lib/types';
import { FileTreeRow } from './file-tree-row';
import { FolderOpen, FolderClosed, PlusCircle, MinusCircle } from 'lucide-react';

type FileTreeProps = {
  rootNode: FolderNode;
  filterMode: FilterMode;
  onToggleIgnore: (path: string) => void;
};

export function FileTree({ rootNode, filterMode, onToggleIgnore }: FileTreeProps) {
  const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(new Set(['']));

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    const paths = new Set<string>();
    
    function collect(node: FolderNode | FileNode) {
      if (node.type === 'folder') {
        paths.add(node.path);
        for (const child of node.children) {
          collect(child);
        }
      }
    }
    
    collect(rootNode);
    setExpandedPaths(paths);
  };

  const collapseAll = () => {
    // Keep only the root path expanded
    setExpandedPaths(new Set(['']));
  };

  // Build the flat list of visible rows recursively
  const getVisibleRows = () => {
    const rows: { node: FolderNode | FileNode; depth: number }[] = [];

    function traverse(node: FolderNode | FileNode, depth: number) {
      if (node.path !== '') {
        rows.push({ node, depth });
      }

      if (node.type === 'folder') {
        const isExpanded = expandedPaths.has(node.path);
        if (isExpanded || node.path === '') {
          for (const child of node.children) {
            traverse(child, node.path === '' ? depth : depth + 1);
          }
        }
      }
    }

    traverse(rootNode, 0);
    return rows;
  };

  const visibleRows = getVisibleRows();

  return (
    <div className="flex flex-col h-full border rounded-xl bg-muted/5 overflow-hidden">
      {/* Tree controls header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/10">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Workspace Structure
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-accent"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Expand All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            className="h-7 px-2 text-xs flex items-center gap-1 hover:bg-accent"
          >
            <MinusCircle className="h-3.5 w-3.5" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Main tree list */}
      <ScrollArea className="flex-1 min-h-[400px] max-h-[600px] h-[55vh]">
        {visibleRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 h-full text-muted-foreground text-sm">
            Folder is empty.
          </div>
        ) : (
          <div className="flex flex-col">
            {visibleRows.map(({ node, depth }) => (
              <FileTreeRow
                key={node.path}
                node={node}
                depth={depth}
                filterMode={filterMode}
                onToggleIgnore={onToggleIgnore}
                isExpanded={expandedPaths.has(node.path)}
                onToggleExpand={() => toggleExpand(node.path)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
