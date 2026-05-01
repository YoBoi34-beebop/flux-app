import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RateDatabase from "./pages/RateDatabase";
import BOQEstimator from "./pages/BOQEstimator";
import BOQDetail from "./pages/BOQDetail";
import ContractorProfile from "./pages/ContractorProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRates from "./pages/AdminRates";
import AdminContractors from "./pages/AdminContractors";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/rates" component={RateDatabase} />
      <Route path="/boq" component={BOQEstimator} />
      <Route path="/boq/:id" component={BOQDetail} />
      <Route path="/profile" component={ContractorProfile} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/rates" component={AdminRates} />
      <Route path="/admin/contractors" component={AdminContractors} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
