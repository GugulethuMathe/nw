import { Switch, Route, Redirect, useLocation } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import MapView from "@/pages/map-view";
import Sites from "@/pages/sites";
import SiteDetail from "@/pages/site-detail";
import SiteEditPage from "@/pages/site-edit";
import SiteAddPage from "@/pages/site-add";
import Staff from "@/pages/staff";
import StaffAddPage from "@/pages/staff-add";
import StaffDetail from "@/pages/staff-detail";
import Assets from "@/pages/assets";
import AssetAddPage from "@/pages/asset-add";
import AssetEditPage from "@/pages/asset-edit"; // Import the new asset edit page
import AssetDetail from "@/pages/asset-detail";
import Programs from "@/pages/programs";
import ProgramAddPage from "@/pages/program-add";
import ProgramDetail from "@/pages/program-detail";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import DistrictsPage from "@/pages/districts"; // Import the new page
import UserListPage from "@/pages/UserListPage"; // Import User List Page
import UserAddPage from "@/pages/UserAddPage";   // Import User Add Page
import UserEditPage from "@/pages/UserEditPage"; // Import User Edit Page
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
      <Route path="/sites/add" component={SiteAddPage} /> {/* Add route for adding */}
      <Route path="/sites/:id/edit" component={SiteEditPage} />
      <Route path="/sites/:id" component={SiteDetail} />
      <Route path="/sites" component={Sites} /> {/* List route should be last for /sites/* */}
      <Route path="/staff/add" component={StaffAddPage} /> {/* Add route for adding staff */}
      <Route path="/staff/:id" component={StaffDetail} /> {/* Add route for viewing staff details */}
      <Route path="/staff" component={Staff} />
      <Route path="/assets/add" component={AssetAddPage} />
      <Route path="/assets/:id/edit" component={AssetEditPage} /> {/* Add route for editing assets */}
      <Route path="/assets/:id" component={AssetDetail} />
      <Route path="/assets" component={Assets} /> {/* List route should be last for /assets/* */}
      <Route path="/programs/add" component={ProgramAddPage} /> {/* Add route for adding programs */}
      <Route path="/programs/:id" component={ProgramDetail} /> {/* Add route for viewing program details */}
      <Route path="/programs" component={Programs} />
      <Route path="/reports" component={Reports} />
      <Route path="/districts" component={DistrictsPage} /> {/* Add route for districts */}
      <Route path="/settings" component={Settings} />
      {/* User Management Routes - kept separate for clarity, can be integrated into ProtectedRoute logic if needed */}
      <Route path="/users/add" component={UserAddPage} />
      <Route path="/users/:id/edit" component={UserEditPage} />
      <Route path="/users" component={UserListPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

const ProtectedRoute: React.FC<{ path: string; component: React.ComponentType<any> }> = ({ path, component: Component }) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!user) {
    // If not logged in, redirect to login page, preserving the intended path
    navigate(`/login?redirect=${encodeURIComponent(path)}`, { replace: true });
    return null; 
  }

  return <Route path={path} component={Component} />;
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading authentication status...</div>;
  }

  // If user is logged in and tries to access /login, redirect to dashboard
  if (user && location === "/login") {
    return <Redirect to="/dashboard" />;
  }

  // If user is not logged in and tries to access anything other than /login, redirect to /login
  if (!user && location !== "/login") {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/map" component={MapView} />
        <ProtectedRoute path="/sites/add" component={SiteAddPage} />
        <ProtectedRoute path="/sites/:id/edit" component={SiteEditPage} />
        <ProtectedRoute path="/sites/:id" component={SiteDetail} />
        <ProtectedRoute path="/sites" component={Sites} />
        <ProtectedRoute path="/districts/new" component={DistrictsPage} />
        <ProtectedRoute path="/districts/:id/edit" component={DistrictsPage} />
        <ProtectedRoute path="/districts" component={DistrictsPage} />
        <ProtectedRoute path="/assets/add" component={AssetAddPage} /> {/* Changed from /new to /add for consistency */}
        <ProtectedRoute path="/assets/:id/edit" component={AssetEditPage} />
        <ProtectedRoute path="/assets/:id" component={AssetDetail} />
        <ProtectedRoute path="/assets" component={Assets} />
        <ProtectedRoute path="/programs/add" component={ProgramAddPage} />
        <ProtectedRoute path="/programs/:id" component={ProgramDetail} />
        <ProtectedRoute path="/programs" component={Programs} />
        <ProtectedRoute path="/staff/add" component={StaffAddPage} />
        <ProtectedRoute path="/staff/:id" component={StaffDetail} />
        <ProtectedRoute path="/staff" component={Staff} />
        <ProtectedRoute path="/reports" component={Reports} />
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/users/add" component={UserAddPage} />
        <ProtectedRoute path="/users/:id/edit" component={UserEditPage} />
        <ProtectedRoute path="/users" component={UserListPage} />
        {/* Add other protected routes here */}
        <Route>
          {/* Default redirect for logged-in users if no route matches, or for non-logged-in users caught by above logic */}
          <Redirect to={user ? "/dashboard" : "/login"} />
        </Route>
      </Switch>
    </AppLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
