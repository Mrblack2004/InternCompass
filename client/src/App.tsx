import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import InternDashboard from "@/pages/intern-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ExcelUpload from "@/pages/excel-upload";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login}/>
      <Route path="/intern" component={InternDashboard}/>
      <Route path="/admin" component={AdminDashboard}/>
      <Route path="/upload" component={ExcelUpload}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
