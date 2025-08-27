
'use client';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, LogIn, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserProfileAction } from "@/app/actions";
import { UserProfile } from "@/services/user-service";
import { Badge } from "./ui/badge";

// This is a placeholder for theme switching logic.
// In a real app, you would use a theme provider (e.g., next-themes).
const useTheme = () => {
    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };
    // This is a simplified check.
    const isDark = typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false;
    const theme = isDark ? 'dark' : 'light';
    return { theme, toggleTheme };
};

// This is a placeholder for auth state.
// In a real app, you would use a context provider to manage auth state.
const useAuth = () => {
  return {
    isLoggedIn: true, // Set to true to show user nav for now
  }
}

const motherhoodStages = {
    'preparation': 'Preparation',
    'pregnancy': 'Pregnancy',
    'fourth-trimester': 'Fourth Trimester',
    'beyond': 'Beyond',
    '': 'Not specified'
};

export function AppHeader() {
  const { toggleTheme, theme } = useTheme();
  const { isLoggedIn } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
        const profile = await getUserProfileAction();
        if(profile && !('error' in profile)) {
            setUser(profile as UserProfile);
        }
    }
    fetchUser();
  }, [])

  return (
    <div className="border-b w-full">
      <div className="flex h-16 items-center px-4 md:px-8">
        <div className="ml-auto flex items-center space-x-4">
          {user && user.phase && (
            <Badge variant="outline" className="hidden sm:flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>{motherhoodStages[user.phase]}</span>
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {isLoggedIn ? <UserNav user={user} /> : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserNav({ user }: { user: UserProfile | null }) {
  const router = useRouter();
  
  if (!user) {
    return null; // Or a loading skeleton
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user.name?.charAt(0) || 'M'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
