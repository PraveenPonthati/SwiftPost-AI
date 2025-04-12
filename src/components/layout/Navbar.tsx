
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Calendar, Settings, LayoutGrid, LogOut, Loader2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, signOut, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  if (!user && !loading) return null;

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    setIsLoggingOut(false);
    navigate('/auth');
  };

  const userInitials = user?.email 
    ? user.email.split('@')[0].substring(0, 2).toUpperCase()
    : 'SS';

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-sidebar p-4 border-r border-border flex flex-col">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center">
          <span className="text-white font-bold">SS</span>
        </div>
        <h1 className="text-xl font-bold">Social Scribe</h1>
      </div>
      
      <div className="space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}
          end
        >
          <Home size={18} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/generate" 
          className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}
        >
          <PlusCircle size={18} />
          <span>Create Content</span>
        </NavLink>
        
        <NavLink 
          to="/templates" 
          className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}
        >
          <LayoutGrid size={18} />
          <span>Templates</span>
        </NavLink>
        
        <NavLink 
          to="/calendar" 
          className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}
        >
          <Calendar size={18} />
          <span>Content Calendar</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center justify-between p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user?.email?.split('@')[0]}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center cursor-pointer text-destructive focus:text-destructive" 
                onClick={handleSignOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm mt-4">
          <p className="font-medium">Need help?</p>
          <p className="text-muted-foreground text-xs mt-1">
            Check out our documentation to get started with AI content generation.
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
