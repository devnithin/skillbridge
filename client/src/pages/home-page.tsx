import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { skillCategories } from "@shared/schema";
import { useState } from "react";
import UserCard from "@/components/user-card";
import { Loader2, Search } from "lucide-react";

export default function HomePage() {
  const [searchParams, setSearchParams] = useState({
    skill: "",
    category: skillCategories[0],
    isTeaching: true,
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/search", searchParams],
    queryFn: async () => {
      const params = new URLSearchParams({
        skill: searchParams.skill,
        ...(searchParams.category && { category: searchParams.category }),
        isTeaching: searchParams.isTeaching.toString(),
      });
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: searchParams.skill.length > 0,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#283E4A] mb-8">Find Skilled People</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid gap-4 md:grid-cols-[1fr_200px_auto]">
            <div>
              <Label htmlFor="skill">Skill</Label>
              <Input
                id="skill"
                placeholder="e.g. JavaScript, Photography, Spanish"
                value={searchParams.skill}
                onChange={(e) => setSearchParams((p) => ({ ...p, skill: e.target.value }))}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={searchParams.category}
                onValueChange={(value: typeof skillCategories[number]) =>
                  setSearchParams((p) => ({ ...p, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
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

            <div className="flex items-end">
              <Button
                onClick={() =>
                  setSearchParams((p) => ({ ...p, isTeaching: !p.isTeaching }))
                }
                variant={searchParams.isTeaching ? "default" : "outline"}
                className="w-full"
              >
                {searchParams.isTeaching ? "Teaching" : "Learning"}
              </Button>
            </div>
          </div>
        </div>

        {!searchParams.skill && (
          <div className="text-center text-muted-foreground py-12">
            <Search className="mx-auto h-12 w-12 mb-4 text-muted" />
            <p>Enter a skill to start searching</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted" />
          </div>
        )}

        {users && users.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p>No users found for your search criteria</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users?.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
}