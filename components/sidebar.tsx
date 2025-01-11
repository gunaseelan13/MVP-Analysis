'use client';

import { ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ReactNode } from 'react'
import { AnalysisContextMenu } from './analysis-context-menu'

interface SidebarProps {
  analyses: Array<{
    id: string
    title: string
    analysis: any
  }>
  selectedAnalysis?: { id: string }
  onSelectAnalysis: (analysis: { id: string; title: string }) => void
  onDeleteAnalysis: (analysisId: string) => void
  onUpdateTitle: (analysisId: string, analysis: any) => void
  updatingTitleId?: string | null
  children?: ReactNode
}

export function Sidebar({
  analyses,
  selectedAnalysis,
  onSelectAnalysis,
  onDeleteAnalysis,
  onUpdateTitle,
  updatingTitleId,
  children
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "group/sidebar h-full border-r bg-background duration-300 ease-in-out",
      isCollapsed ? "w-[50px]" : "w-[250px]"
    )}>
      <div className="relative h-full">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-4 top-2 z-20 h-8 w-8 rounded-full border opacity-0 group-hover/sidebar:opacity-100",
            isCollapsed && "rotate-180"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className={cn(
          "h-full w-full",
          isCollapsed && "hidden"
        )}>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Saved Analyses</h2>
            </div>

            {children}

            <div className="space-y-1">
              {analyses.map((analysis) => (
                <AnalysisContextMenu
                  key={analysis.id}
                  onDelete={() => onDeleteAnalysis(analysis.id)}
                  onUpdateTitle={() => onUpdateTitle(analysis.id, analysis.analysis)}
                  isUpdatingTitle={updatingTitleId === analysis.id}
                >
                  <Button
                    variant={selectedAnalysis?.id === analysis.id ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    onClick={() => onSelectAnalysis(analysis)}
                  >
                    <span className="truncate">{analysis.title}</span>
                  </Button>
                </AnalysisContextMenu>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
