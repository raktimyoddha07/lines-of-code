'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Plus, Info } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

type IgnoreListPanelProps = {
  ignoreList: string[];
  onAddIgnore: (pattern: string) => void;
  onRemoveIgnore: (pattern: string) => void;
};

export function IgnoreListPanel({ ignoreList, onAddIgnore, onRemoveIgnore }: IgnoreListPanelProps) {
  const [patternInput, setPatternInput] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = patternInput.trim();
    if (clean && !ignoreList.includes(clean)) {
      onAddIgnore(clean);
      setPatternInput('');
    }
  };

  return (
    <Card className="border bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          Manual Ignore Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Form to add pattern */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="e.g. **/*.test.ts, dist/ ..."
            value={patternInput}
            onChange={(e) => setPatternInput(e.target.value)}
            className="flex-1 bg-background/50 border-input"
          />
          <Button type="submit" size="sm" className="shrink-0 flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </form>

        {/* Info tips */}
        <div className="flex gap-1.5 text-xs text-muted-foreground bg-muted/35 rounded-lg p-2.5 border border-border/30">
          <Info className="h-4 w-4 shrink-0 text-muted-foreground/80" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Glob Matching:</span>
            <span>- Use <code className="text-foreground">*</code> for single-level wildcards (e.g. <code className="text-foreground">*.js</code>)</span>
            <span>- Use <code className="text-foreground">**</code> for multi-level wildcards (e.g. <code className="text-foreground">**/*.test.ts</code>)</span>
            <span>- Slashes match paths from project root (e.g. <code className="text-foreground">src/legacy/</code>)</span>
          </div>
        </div>

        {/* List of active patterns */}
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {ignoreList.length === 0 ? (
            <div className="text-xs text-muted-foreground italic text-center py-4 bg-muted/10 border border-dashed rounded-lg">
              No manual ignore rules configured.
            </div>
          ) : (
            ignoreList.map((pattern, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md border bg-background/30 text-sm"
              >
                <code className="text-xs font-semibold truncate max-w-[80%]" title={pattern}>
                  {pattern}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-950/20"
                  onClick={() => onRemoveIgnore(pattern)}
                  title="Remove rule"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
