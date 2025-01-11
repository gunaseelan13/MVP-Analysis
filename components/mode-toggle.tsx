"use client"

import { Button } from "@/components/ui/button"
import { Bolt } from "lucide-react"

export function ModeToggle() {
  const openBolt = () => {
    window.open('http://localhost:5173', '_blank', 'noopener,noreferrer')
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative"
      onClick={openBolt}
      title="Open Bolt DIY"
    >
      <Bolt className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      <span className="sr-only">Open Bolt DIY in new tab</span>
    </Button>
  )
}
