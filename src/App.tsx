
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ContentProvider } from "./contexts/ContentContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Generate from "./pages/Generate";
import Templates from "./pages/Templates";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import AIChat from "./pages/AIChat";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Navbar from "./components/layout/Navbar";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Layout component with Navbar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Check if we have a URL like /auth?email=...&password=... for automatic login
    const url = new URL(window.location.href);
    const email = url.searchParams.get('email');
    const password = url.searchParams.get('password');
    
    if (email && password && !user && !loading) {
      // Automatic login for the provided credentials
      // This is just for demonstration purposes
      setTimeout(() => {
        document.getElementById('signin-email')?.setAttribute('value', email);
        document.getElementById('signin-password')?.setAttribute('value', password);
        
        // Clean the URL
        window.history.replaceState({}, document.title, "/auth");
      }, 500);
    }
  }, [user, loading]);

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <Index />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/generate" element={
        <ProtectedRoute>
          <AppLayout>
            <Generate />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/templates" element={
        <ProtectedRoute>
          <AppLayout>
            <Templates />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/calendar" element={
        <ProtectedRoute>
          <AppLayout>
            <Calendar />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-chat" element={
        <ProtectedRoute>
          <AppLayout>
            <AIChat />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ContentProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </BrowserRouter>
      </ContentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
