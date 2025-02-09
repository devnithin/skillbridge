
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type User, type Skill } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Phone, MapPin, Award, Briefcase } from "lucide-react";
import SkillCard from "./skill-card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function UserCard({ user }: { user: User }) {
  const { data: skills = [], isLoading } = useQuery<Skill[]>({
    queryKey: [`/api/users/${user.id}/skills`],
  });

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback>{user.fullName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{user.fullName}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || "No bio"}</p>
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">View Profile</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback>{user.fullName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl mb-2">{user.fullName}</DialogTitle>
                <p className="text-muted-foreground">{user.bio || "No bio available"}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" /> Contact Information
              </h3>
              <div className="grid gap-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email}
                </p>
                {user.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Award className="h-4 w-4" /> Skills & Expertise
              </h3>
              {isLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted" />
                </div>
              ) : (
                <div className="grid gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No skills listed yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
