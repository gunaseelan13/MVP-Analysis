"use client"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Trash2, RefreshCw } from "lucide-react"

interface AnalysisContextMenuProps {
  children: React.ReactNode
  onDelete: () => void
  onUpdateTitle: () => void
  isUpdatingTitle?: boolean
}

export function AnalysisContextMenu({
  children,
  onDelete,
  onUpdateTitle,
  isUpdatingTitle = false,
}: AnalysisContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          className="flex items-center gap-2"
          onClick={onUpdateTitle}
          disabled={isUpdatingTitle}
        >
          <RefreshCw className={`h-4 w-4 ${isUpdatingTitle ? 'animate-spin' : ''}`} />
          {isUpdatingTitle ? 'Updating Title...' : 'Generate New Title'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive flex items-center gap-2"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete Analysis
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
