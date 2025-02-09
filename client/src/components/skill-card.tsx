import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { type Skill } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function SkillCard({
  skill,
  onDelete,
}: {
  skill: Skill;
  onDelete?: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{skill.name}</h3>
            <Badge variant={skill.isTeaching ? "default" : "outline"}>
              {skill.isTeaching ? "Teaching" : "Learning"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{skill.category}</span>
            <span>•</span>
            <span>{skill.proficiency}</span>
          </div>
        </div>

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
