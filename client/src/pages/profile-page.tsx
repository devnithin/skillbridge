import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertSkillSchema, proficiencyLevels, skillCategories, type Skill } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlusCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SkillCard from "@/components/skill-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertSkillSchema),
    defaultValues: {
      name: "",
      category: skillCategories[0],
      isTeaching: true,
      proficiency: proficiencyLevels[0],
    },
  });

  const { data: skills = [], isLoading: isLoadingSkills } = useQuery<Skill[]>({
    queryKey: [`/api/users/${user!.id}/skills`],
  });

  const addSkillMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/skills", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user!.id}/skills`] });
      form.reset();
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      await apiRequest("DELETE", `/api/skills/${skillId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user!.id}/skills`] });
    },
  });

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg border-primary/10 p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#283E4A]">{user?.fullName}</h1>
              <div className="relative group">
                <textarea 
                  className="w-full bg-transparent text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary rounded p-1"
                  defaultValue={user?.bio || ""}
                  placeholder="Add a bio..."
                  rows={2}
                  onBlur={async (e) => {
                    if (e.target.value !== user?.bio) {
                      await fetch(`/api/users/${user!.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bio: e.target.value })
                      });
                      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Email</Label>
              <p className="text-sm">{user?.email}</p>
            </div>
            {user?.phone && (
              <div>
                <Label>Phone</Label>
                <p className="text-sm">{user.phone}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Skills</h2>

          <form
            onSubmit={form.handleSubmit((data) => addSkillMutation.mutate(data))}
            className="grid gap-4 md:grid-cols-[1fr_200px_auto_150px_auto] mb-8"
          >
            <div>
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input id="skill-name" {...form.register("name")} />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value: typeof skillCategories[number]) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-0.5">
                <Button
                  type="button"
                  onClick={() => form.setValue("isTeaching", true)}
                  variant={form.watch("isTeaching") ? "default" : "outline"}
                  className="flex-1"
                >
                  Teaching
                </Button>
                <Button
                  type="button"
                  onClick={() => form.setValue("isTeaching", false)}
                  variant={!form.watch("isTeaching") ? "default" : "outline"}
                  className="flex-1"
                >
                  Learning
                </Button>
              </div>
            </div>

            <div>
              <Label>Proficiency</Label>
              <Select
                value={form.watch("proficiency")}
                onValueChange={(value: typeof proficiencyLevels[number]) => form.setValue("proficiency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={addSkillMutation.isPending}>
                {addSkillMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4 mr-2" />
                )}
                Add Skill
              </Button>
            </div>
          </form>

          {isLoadingSkills && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted" />
            </div>
          )}

          <div className="grid gap-4">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onDelete={() => deleteSkillMutation.mutate(skill.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}