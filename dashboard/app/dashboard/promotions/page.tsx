"use client";

import { PromotionForm } from "@/components/forms/PromotionForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { PromotionFormData } from "@/lib/validators/promotion";
import { Edit, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Promotion {
  _id: string;
  title: string;
  bannerImage?: string;
  shortText: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export default function PromotionsPage() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/promotions");
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: PromotionFormData) => {
    try {
      const url = editingPromotion
        ? `/api/promotions/${editingPromotion._id}`
        : "/api/promotions";
      const method = editingPromotion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save promotion");
      }

      await fetchPromotions();
      setEditingPromotion(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) {
      return;
    }

    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete promotion");
      }

      toast({
        title: "Success",
        description: "Promotion deleted successfully",
      });

      await fetchPromotions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingPromotion(null);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Promotions</h1>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Promotion
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {promotions.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              No promotions yet
            </CardContent>
          </Card>
        ) : (
          promotions.map((promo) => (
            <Card key={promo._id}>
              {promo.bannerImage && (
                <div className="relative h-48 w-full">
                  <Image
                    src={promo.bannerImage}
                    alt={promo.title}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{promo.title}</CardTitle>
                  <Badge variant={promo.active ? "default" : "secondary"}>
                    {promo.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 mb-4">{promo.shortText}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(promo)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(promo._id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <PromotionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingPromotion || undefined}
      />
    </div>
  );
}
