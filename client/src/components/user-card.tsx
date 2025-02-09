import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type User } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SkillCard from "./skill-card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function UserCard({ user }: { user: User }) {
  const { data: skills, isLoading } = useQuery({
    queryKey: [`/api/users/${user.id}/skills`],
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.fullName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{user.fullName}</h3>
          <p className="text-sm text-muted-foreground">{user.bio || "No bio"}</p>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">View Profile</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{user.fullName}</DialogTitle>
            <DialogDescription>
              Contact: {user.email} {user.phone && `• ${user.phone}`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <h4 className="font-medium mb-4">Skills</h4>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted" />
              </div>
            ) : (
              <div className="space-y-2">
                {skills?.map((skill: any) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
