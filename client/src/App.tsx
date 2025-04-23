import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import MapView from "@/pages/map-view";
import Sites from "@/pages/sites";
import SiteDetail from "@/pages/site-detail";
import Staff from "@/pages/staff";
import Assets from "@/pages/assets";
import Programs from "@/pages/programs";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import AppLayout from "@/layout/AppLayout";
import { OnboardingProvider } from "@/components/tutorial/OnboardingContext";
import { TutorialTooltip } from "@/components/tutorial/TutorialTooltip";
import { HelpButton } from "@/components/tutorial/HelpButton";
import { WelcomeDialog } from "@/components/tutorial/WelcomeDialog";
import { TutorialProgress } from "@/components/tutorial/TutorialProgress";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/map" component={MapView} />
      <Route path="/sites" component={Sites} />
      <Route path="/sites/:id" component={SiteDetail} />
      <Route path="/staff" component={Staff} />
      <Route path="/assets" component={Assets} />
      <Route path="/programs" component={Programs} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <OnboardingProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <TutorialTooltip />
        <HelpButton />
        <WelcomeDialog />
        <TutorialProgress />
      </OnboardingProvider>
    </TooltipProvider>
  );
}

export default App;
