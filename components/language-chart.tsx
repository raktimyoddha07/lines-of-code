'use client';

import * as React from 'react';
import { getLanguageColor } from '@/lib/colors';
import { LanguageStat, FilterMode } from '@/lib/types';

type LanguageChartProps = {
  languageStats: LanguageStat[];
  filterMode: FilterMode;
};

export function LanguageChart({ languageStats, filterMode }: LanguageChartProps) {
  // Helper to extract line counts based on current FilterMode
  const getLines = (stat: LanguageStat) => {
    switch (filterMode) {
      case 'excludeBlank':
        return stat.totalLines - stat.blankLines;
      case 'excludeComments':
        return stat.totalLines - stat.commentLines;
      case 'excludeBoth':
        return stat.codeLines;
      case 'all':
      default:
        return stat.totalLines;
    }
  };

  const statsWithLines = languageStats
    .map(stat => ({
      name: stat.language,
      lines: getLines(stat),
      files: stat.files
    }))
    .filter(stat => stat.lines > 0);

  const totalLines = statsWithLines.reduce((sum, stat) => sum + stat.lines, 0);

  const statsWithPercentage = statsWithLines.map(stat => ({
    ...stat,
    percentage: totalLines > 0 ? (stat.lines / totalLines) * 100 : 0
  }));

  if (statsWithPercentage.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10 text-muted-foreground text-sm">
        No language data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Percentage Bar */}
      <div className="h-3 w-full flex rounded-full overflow-hidden bg-muted">
        {statsWithPercentage.map((stat, i) => (
          <div
            key={i}
            style={{
              width: `${stat.percentage}%`,
              backgroundColor: getLanguageColor(stat.name)
            }}
            className="h-full transition-all duration-300"
            title={`${stat.name}: ${stat.percentage.toFixed(1)}% (${stat.lines.toLocaleString()} lines)`}
          />
        ))}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {statsWithPercentage.map((stat, i) => {
          const color = getLanguageColor(stat.name);
          return (
            <div key={i} className="flex flex-col p-2.5 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold truncate" title={stat.name}>
                  {stat.name}
                </span>
              </div>
              <div className="mt-1.5 flex flex-col">
                <span className="text-xs text-muted-foreground">
                  {stat.percentage.toFixed(1)}%
                </span>
                <span className="text-[11px] text-muted-foreground/75 mt-0.5">
                  {stat.lines.toLocaleString()} lines ({stat.files} {stat.files === 1 ? 'file' : 'files'})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
