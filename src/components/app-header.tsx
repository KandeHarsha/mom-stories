
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
import { Moon, Sun, LogIn, Heart, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { useUser } from "@/context/user-context";

const useTheme = () => {
    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };
    const isDark = typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false;
    const theme = isDark ? 'dark' : 'light';
    return { theme, toggleTheme };
};

const motherhoodStages = {
    'preparation': 'Preparation',
    'pregnancy': 'Pregnancy',
    'fourth-trimester': 'Fourth Trimester',
    'beyond': 'Beyond',
    '': 'Not specified'
};

export function AppHeader() {
  const { toggleTheme } = useTheme();
  const { user, isLoggedIn } = useUser();

  return (
    <div className="border-b w-full">
      <div className="flex h-16 items-center px-4 md:px-8">
         {isLoggedIn && user && user.phase && (
            <Badge variant="outline" className="hidden sm:flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>{motherhoodStages[user.phase as keyof typeof motherhoodStages]}</span>
            </Badge>
          )}
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {isLoggedIn && user ? <UserNav /> : (
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

function UserNav() {
  const router = useRouter();
  const { user, logout } = useUser();
    
  const handleLogout = async () => {
    await logout();
    // Full page redirect to clear all state.
    window.location.href = '/login';
  };

  if (!user) {
    return null; // Or a loading skeleton
  }
  
  const userName = user.FirstName || user.name || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{userName.charAt(0).toUpperCase() || 'M'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.Email && user.Email.length > 0 ? user.Email[0].Value : user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
