import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GalleryItem from "@/lib/db/models/GalleryItem";
import connectDB from "@/lib/db/mongoose";
import { Plus } from "lucide-react";
import Image from "next/image";

async function getGalleryItems() {
  try {
    await connectDB();
    const items = await GalleryItem.find().sort({ createdAt: -1 }).lean();
    return items.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt.toString(),
    }));
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Gallery</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              No gallery items yet
            </CardContent>
          </Card>
        ) : (
          items.map((item: any) => (
            <Card key={item._id} className="overflow-hidden">
              <div className="relative h-64 w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.caption || "Gallery image"}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-sm">
                  {item.caption || "Untitled"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm" className="w-full">
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
