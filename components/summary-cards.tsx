'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Folder, File, Code2 } from 'lucide-react';

type SummaryCardsProps = {
  totalLines: number;
  totalFiles: number;
  totalFolders: number;
  totalLanguages: number;
};

export function SummaryCards({ totalLines, totalFiles, totalFolders, totalLanguages }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Lines',
      value: totalLines.toLocaleString(),
      description: 'Lines matching current filter',
      icon: FileText,
      color: 'text-emerald-400 border-emerald-950/50'
    },
    {
      title: 'Scanned Files',
      value: totalFiles.toLocaleString(),
      description: 'Non-ignored files',
      icon: File,
      color: 'text-blue-400 border-blue-950/50'
    },
    {
      title: 'Folders Walked',
      value: totalFolders.toLocaleString(),
      description: 'Non-ignored directories',
      icon: Folder,
      color: 'text-amber-400 border-amber-950/50'
    },
    {
      title: 'Languages',
      value: totalLanguages.toLocaleString(),
      description: 'Detected syntax groups',
      icon: Code2,
      color: 'text-purple-400 border-purple-950/50'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card key={i} className={`border bg-muted/20 hover:bg-muted/40 transition-colors ${card.color}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
