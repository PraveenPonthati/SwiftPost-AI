
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, Calendar, Settings, LayoutGrid } from 'lucide-react';

const Navbar = () => {
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
        <div className="bg-muted rounded-lg p-3 text-sm">
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
