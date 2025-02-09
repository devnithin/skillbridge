import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MessageSquare, Search, User } from "lucide-react";

export default function NavBar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user || location === "/auth") return null;

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#0077B5]">
            SkillBridge
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/">
              <Button variant={location === "/" ? "default" : "ghost"}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant={location === "/messages" ? "default" : "ghost"}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant={location === "/profile" ? "default" : "ghost"}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}