"use client";

import { AnnouncementForm } from "@/components/forms/AnnouncementForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { AnnouncementFormData } from "@/lib/validators/announcement";
import { format } from "date-fns";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  scheduledDate?: string;
  active: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: AnnouncementFormData) => {
    try {
      const url = editingAnnouncement
        ? `/api/announcements/${editingAnnouncement._id}`
        : "/api/announcements";
      const method = editingAnnouncement ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save announcement");
      }

      await fetchAnnouncements();
      setEditingAnnouncement(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete announcement");
      }

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });

      await fetchAnnouncements();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Announcements</h1>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No announcements yet
            </CardContent>
          </Card>
        ) : (
          announcements.map((ann) => (
            <Card key={ann._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{ann.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={ann.active ? "default" : "secondary"}>
                      {ann.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{ann.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 mb-4">{ann.message}</p>
                {ann.scheduledDate && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Scheduled: {format(new Date(ann.scheduledDate), "PPp")}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(ann)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(ann._id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AnnouncementForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingAnnouncement || undefined}
      />
    </div>
  );
}
