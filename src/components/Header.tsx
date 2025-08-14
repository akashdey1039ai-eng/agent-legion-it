import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Brain, Bell, HelpCircle, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user, signOut } = useAuth();

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const handleThemeToggle = () => {
    // Theme toggle functionality can be implemented here
    console.log('Theme toggle clicked');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative p-2.5 bg-gradient-hero rounded-xl shadow-glow">
              <Brain className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-hero leading-none">
                Universal CRM AI
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Enterprise Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center Navigation - Optional for future use */}
        <div className="hidden md:flex items-center space-x-1">
          <Badge variant="outline" className="text-xs font-medium border-primary/20 text-primary">
            v2.1.0
          </Badge>
        </div>
        
        {/* User Section */}
        {user && (
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>

            {/* Help */}
            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-primary/10 hover:border-primary/20 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm">
                      {getUserInitials(user.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-primary text-white text-xs">
                          {getUserInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          CRM AI Analyst
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">Pro Plan</Badge>
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                        Online
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem className="rounded-md">
                  <User className="mr-3 h-4 w-4" />
                  <span>Profile & Account</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="rounded-md">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="rounded-md" onClick={handleThemeToggle}>
                  <Palette className="mr-3 h-4 w-4" />
                  <span>Appearance</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem 
                  className="rounded-md text-red-600 focus:text-red-600 focus:bg-red-50" 
                  onClick={signOut}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}