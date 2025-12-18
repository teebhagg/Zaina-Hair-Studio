"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  customerEmail: string
  customerName: string
  appointmentDate?: string
  appointmentTime?: string
  service?: string
}

export function SendMessageDialog({
  open,
  onOpenChange,
  appointmentId,
  customerEmail,
  customerName,
  appointmentDate,
  appointmentTime,
  service,
}: SendMessageDialogProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          appointmentDate,
          appointmentTime,
          service,
        }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Message sent successfully",
        })
        setMessage("")
        onOpenChange(false)
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "Failed to send message",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-card to-card/50 border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Send Message
          </DialogTitle>
          <DialogDescription className="text-base">
            Send an email to {customerName} ({customerEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setMessage("")
                onOpenChange(false)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



