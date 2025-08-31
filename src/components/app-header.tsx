'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";

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
    'beyond': 'Beyond'
};


export function AppHeader() {
  const { toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    const profile = localStorage.getItem('user_profile');
    if (token && profile) {
      setIsLoggedIn(true);
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  return (
    <div className="border-b w-full">
      <div className="flex h-16 items-center px-4 md:px-8">
         {isLoggedIn && userProfile?.phase && (
            <Badge variant="outline" className="hidden sm:flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>{motherhoodStages[userProfile.phase as keyof typeof motherhoodStages]}</span>
            </Badge>
          )}
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {isLoggedIn && userProfile ? <UserNav user={userProfile}/> : (
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

function UserNav({ user }: { user: any }) {
  const router = useRouter();
  
  const handleLogout = async () => {
    // Call the logout API endpoint
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch(e) {
        console.error('Logout failed', e);
    }
    // Clear client-side storage
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_profile');
    // Redirect to login page
    router.push('/login');
  };

  const userName = user.FirstName || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
             {user.ImageUrl && <AvatarImage src={user.ImageUrl} alt={userName} />}
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.Email[0].Value}
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
