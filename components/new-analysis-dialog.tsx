"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface NewAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAnalyze: (content: string, title: string) => Promise<void>
  analyzing: boolean
  error: string | null
}

export function NewAnalysisDialog({
  open,
  onOpenChange,
  onAnalyze,
  analyzing,
  error
}: NewAnalysisDialogProps) {
  const [content, setContent] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [rawWebsiteData, setRawWebsiteData] = useState('')
  const [filteredComments, setFilteredComments] = useState('')
  const [filteringComments, setFilteringComments] = useState(false)
  const [processingWebsite, setProcessingWebsite] = useState(false)
  const [activeTab, setActiveTab] = useState('text')
  const [title, setTitle] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const handleWebsiteProcess = async () => {
    try {
      setProcessingWebsite(true)
      const response = await fetch('/api/process-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to process website')
      }
      
      const data = await response.json()
      setRawWebsiteData(data.rawText)
      setFilteredComments('') // Reset filtered comments when new content is fetched
      
    } catch (error) {
      console.error('Error processing website:', error)
      setLocalError('Failed to process website')
    } finally {
      setProcessingWebsite(false)
    }
  }

  const handleFilterComments = async () => {
    if (!rawWebsiteData) {
      setLocalError('No website content to filter')
      return
    }

    setFilteringComments(true)
    setLocalError(null)

    try {
      const response = await fetch('/api/filter-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: rawWebsiteData }),
      })

      if (!response.ok) {
        throw new Error('Failed to filter comments')
      }

      const { comments } = await response.json()
      const formattedComments = comments.join('\n\n')
      
      setFilteredComments(formattedComments)
      setContent(formattedComments) // Set the filtered comments as content for analysis
    } catch (error) {
      console.error('Error filtering comments:', error)
      setLocalError('Failed to filter comments')
    } finally {
      setFilteringComments(false)
    }
  }

  const handleAnalyze = async () => {
    setLocalError(null);

    if (!content.trim()) {
      setLocalError('Please enter some text to analyze');
      return;
    }
    
    const finalTitle = title.trim() || `Analysis ${new Date().toLocaleString()}`;
    
    // Close dialog immediately
    onOpenChange(false);
    
    // Reset states
    setContent('');
    setWebsiteUrl('');
    setRawWebsiteData('');
    setFilteredComments('');
    
    // Start analysis in background
    onAnalyze(content, finalTitle);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Analysis</DialogTitle>
          <DialogDescription>
            Enter a website URL or paste text to analyze
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Input
              placeholder="Analysis Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="website">Website</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <div className="grid gap-2">
                <Textarea
                  placeholder="Enter text to analyze..."
                  className="h-[300px]"
                  value={content}
                  onChange={handleTextChange}
                />
              </div>
            </TabsContent>

            <TabsContent value="website">
              <div className="grid gap-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter website URL..."
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleWebsiteProcess}
                    disabled={!websiteUrl || analyzing || processingWebsite}
                  >
                    {processingWebsite ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process'
                    )}
                  </Button>
                </div>

                {rawWebsiteData && (
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Raw Website Content</span>
                      <Button
                        onClick={handleFilterComments}
                        disabled={filteringComments}
                        variant="outline"
                        size="sm"
                      >
                        {filteringComments ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Filtering...
                          </>
                        ) : (
                          'Filter Comments'
                        )}
                      </Button>
                    </div>
                    <Textarea
                      className="h-[300px]"
                      value={filteredComments || rawWebsiteData}
                      readOnly
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {(error || localError) && (
          <div className="text-sm text-red-500 mt-2">
            {error || localError}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || (!content && !rawWebsiteData)}
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
