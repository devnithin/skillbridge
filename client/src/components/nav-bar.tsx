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
    <header className="bg-white/80 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#0077B5] to-[#00A0DC] text-transparent bg-clip-text hover:opacity-80 transition-opacity">
            SkillBridge
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant={location === "/" ? "default" : "ghost"} className="rounded-full hover:bg-gray-100 transition-colors">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant={location === "/profile" ? "default" : "ghost"} className="rounded-full hover:bg-gray-100 transition-colors">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-colors">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-primary/5">{user.fullName[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer font-medium">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 font-medium"
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