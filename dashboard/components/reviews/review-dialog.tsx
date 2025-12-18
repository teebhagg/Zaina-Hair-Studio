"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Star, 
  User, 
  Mail, 
  Calendar,
  MessageSquare,
  Trash2,
  Loader2,
  Send
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReviewDetails {
  _id: string
  rating: number
  text: string
  author: string
  email?: string
  verified: boolean
  replies: Array<{
    text: string
    author: string
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

interface ReviewDialogProps {
  reviewId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function ReviewDialog({
  reviewId,
  open,
  onOpenChange,
  onUpdate,
}: ReviewDialogProps) {
  const [review, setReview] = useState<ReviewDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [adminName, setAdminName] = useState<string>("Admin")
  const { toast } = useToast()

  // Fetch admin name when dialog opens
  useEffect(() => {
    if (open) {
      async function fetchAdminName() {
        try {
          const res = await fetch('/api/admin/me')
          if (res.ok) {
            const data = await res.json()
            setAdminName(data.name || "Admin")
          }
        } catch (error) {
          console.error("Error fetching admin name:", error)
        }
      }
      fetchAdminName()
    }
  }, [open])

  useEffect(() => {
    if (open && reviewId) {
      fetchReview()
    } else {
      setReview(null)
      setReplyText("")
    }
  }, [open, reviewId])

  const fetchReview = async () => {
    if (!reviewId) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`)
      if (res.ok) {
        const data = await res.json()
        setReview(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch review details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching review:", error)
      toast({
        title: "Error",
        description: "Failed to fetch review details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!reviewId || !review || !replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      })
      return
    }

    setReplying(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: replyText.trim(),
          author: adminName,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setReview(updated)
        setReplyText("")
        toast({
          title: "Success",
          description: "Reply posted successfully",
        })
        onUpdate?.()
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to post reply",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error posting reply:", error)
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    } finally {
      setReplying(false)
    }
  }

  const handleDelete = async () => {
    if (!reviewId || !review) return

    if (!confirm(`Are you sure you want to delete this review by ${review.author}?`)) {
      return
    }

    setUpdating(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Review deleted successfully",
        })
        onOpenChange(false)
        onUpdate?.()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete review",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }


  const reviewDate = review?.createdAt 
    ? (typeof review.createdAt === 'string' ? new Date(review.createdAt) : review.createdAt)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : review ? (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Review Details
              </DialogTitle>
              <DialogDescription className="text-base">
                View and manage review information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{review.author}</p>
                  </div>
                  {review.email && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="font-medium">{review.email}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date
                    </p>
                    <p className="font-medium">
                      {reviewDate ? format(reviewDate, "PPP") : review.createdAt}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-primary text-primary'
                              : 'fill-none text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Review Content */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Review Comment
                </h3>
                <p className="text-sm text-foreground/90 pl-7 bg-muted/30 p-3 rounded-lg">
                  {review.text}
                </p>
              </div>

              {/* Replies */}
              {review.replies && review.replies.length > 0 && (
                <>
                  <Separator className="bg-border/50" />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Replies</h3>
                    <div className="space-y-3 pl-7">
                      {review.replies.map((reply, idx) => (
                        <div key={idx} className="bg-muted/30 p-3 rounded-lg border-l-2 border-primary/30">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-primary">{reply.author}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(reply.createdAt), "PPP")}
                            </p>
                          </div>
                          <p className="text-sm text-foreground/90">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator className="bg-border/50" />

              {/* Reply Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Reply to Review</h3>
                <div className="space-y-2 pl-7">
                  <Label htmlFor="reply">Your Reply</Label>
                  <Textarea
                    id="reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    rows={3}
                  />
                  <Button
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {replying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Post Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleDelete}
                    disabled={updating}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Review
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No review selected
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

