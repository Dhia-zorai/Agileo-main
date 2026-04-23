import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Kanban, MessagesSquare, BarChart3 } from "lucide-react";

import Auth from "./pages/Auth";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import MyTasksPage from "./pages/MyTasksPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors closeButton />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
            <Route path="/my-tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
            <Route path="/board" element={<ProtectedRoute><ComingSoonPage title="Board" icon={Kanban} /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ComingSoonPage title="Chat" icon={MessagesSquare} /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ComingSoonPage title="Reports" icon={BarChart3} /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
