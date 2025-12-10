import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const name = session.user.name ?? "Admin";
  const email = session.user.email ?? "unknown@example.com";
  const role = (session.user as any).role ?? "admin";

  const initials = name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>1. Home</span>
          <span>/</span>
          <span className="text-foreground">Profile</span>
        </nav>
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground">
          View your account details and admin information.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
            {initials}
          </div>
          <div>
            <CardTitle>{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="uppercase tracking-wide">
              {role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Name</p>
            <p className="text-sm font-medium">{name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium">{email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Role</p>
            <p className="text-sm font-medium capitalize">{role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


