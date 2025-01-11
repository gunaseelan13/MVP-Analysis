"use client"

import { Card } from "@/components/ui/card"

export function AnalysisShimmer() {
  return (
    <div className="flex w-full animate-pulse">
      {/* Comments Analysis (40%) */}
      <div className="w-[40%] border-r overflow-auto">
        <div className="space-y-6 p-4">
          {/* Summary Card */}
          <Card className="p-4 space-y-3">
            <div className="h-5 w-24 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-40 bg-muted rounded"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
            </div>
          </Card>

          {/* Pain Points Card */}
          <Card className="p-4 space-y-4">
            <div className="h-5 w-28 bg-muted rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="flex gap-4">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-4 w-24 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3 space-y-2">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                    <div className="space-y-1">
                      <div className="h-3 w-full bg-muted rounded"></div>
                      <div className="h-3 w-4/5 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Ideas Analysis (60%) */}
      <div className="w-[60%] overflow-auto">
        <div className="p-4">
          <Card className="p-4 space-y-4">
            <div className="h-5 w-32 bg-muted rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-muted rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-muted rounded"></div>
                      <div className="h-8 w-28 bg-muted rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
