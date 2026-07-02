'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Folder, File, EyeOff, Eye, Binary } from 'lucide-react';
import { FileNode, FolderNode, FilterMode } from '@/lib/types';
import { getLanguageColor } from '@/lib/colors';
import { getFileLineCount } from '@/lib/aggregate';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type FileTreeRowProps = {
  node: FileNode | FolderNode;
  depth: number;
  filterMode: FilterMode;
  onToggleIgnore: (path: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
};

export function FileTreeRow({
  node,
  depth,
  filterMode,
  onToggleIgnore,
  isExpanded,
  onToggleExpand
}: FileTreeRowProps) {
  const isFolder = node.type === 'folder';
  const isIgnored = (node as any).ignored;

  // Format bytes for display
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getLinesCount = () => {
    if (isFolder) {
      const folder = node as FolderNode;
      switch (filterMode) {
        case 'excludeBlank':
          return folder.totalLines - folder.blankLines;
        case 'excludeComments':
          return folder.totalLines - folder.commentLines;
        case 'excludeBoth':
          return folder.codeLines;
        case 'all':
        default:
          return folder.totalLines;
      }
    } else {
      return getFileLineCount(node as FileNode, filterMode);
    }
  };

  return (
    <div
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      className={cn(
        "group flex items-center justify-between py-1.5 pr-4 border-b border-border/20 text-sm hover:bg-accent/40 transition-colors",
        isIgnored && "text-muted-foreground bg-muted/5 line-through opacity-60"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Toggle Chevron for Folders */}
        {isFolder ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Node Icon */}
        {isFolder ? (
          <Folder className="h-4 w-4 text-sky-400 shrink-0" />
        ) : (
          <File className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        {/* Name / Dot */}
        <div className="flex items-center gap-1.5 min-w-0">
          {!isFolder && (node as FileNode).language && !(node as FileNode).binary && (
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: getLanguageColor((node as FileNode).language) }}
            />
          )}
          <span className="truncate font-medium">{node.name}</span>
        </div>

        {/* Ignored / Binary Badges */}
        {isIgnored && (
          <Badge variant="outline" className="h-4 px-1 text-[10px] uppercase font-bold text-amber-500 border-amber-950/30 bg-amber-950/10">
            Ignored
          </Badge>
        )}
        {!isFolder && (node as FileNode).binary && (
          <Badge variant="outline" className="h-4 px-1 text-[10px] uppercase font-bold text-teal-500 border-teal-950/30 bg-teal-950/10 flex items-center gap-0.5">
            <Binary className="h-2.5 w-2.5" />
            Binary
          </Badge>
        )}
      </div>

      {/* Right Side Info & Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Line Count or Size */}
        <span className="text-xs text-muted-foreground font-mono">
          {!isFolder && (node as FileNode).binary ? (
            formatBytes((node as FileNode).sizeBytes)
          ) : (
            <>
              {getLinesCount().toLocaleString()} lines
              {!isFolder && ` (${formatBytes((node as FileNode).sizeBytes)})`}
            </>
          )}
        </span>

        {/* Ignore / Restore Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          {isIgnored ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
              title="Restore / Un-ignore"
              onClick={() => onToggleIgnore(node.path)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-950/30"
              title="Ignore this path"
              onClick={() => onToggleIgnore(node.path)}
            >
              <EyeOff className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
