import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout";
import { ProtectedLayout } from "./components/protected-layout";
import { HubProtectedLayout } from "./components/hub-protected-layout";
import { Dashboard } from "./pages/dashboard";
import { Inventory } from "./pages/inventory";
import { InventorySummary } from "./pages/inventory-summary";
import { PlantingCalendar } from "./pages/planting-calendar";
import { PriceAnalysis } from "./pages/price-analysis";
import { PriceComparison } from "./pages/price-comparison";
import { Recommendations } from "./pages/recommendations";
import { ActivityLog } from "./pages/activity-log";
import { Members } from "./pages/members";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Hub } from "./pages/hub";
import { Profile } from "./pages/profile";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/hub",
    Component: Hub,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "inventory", Component: Inventory },
      { path: "summary", Component: InventorySummary },
      { path: "calendar", Component: PlantingCalendar },
      { path: "analysis", Component: PriceAnalysis },
      { path: "price-comparison", Component: PriceComparison },
      { path: "recommendations", Component: Recommendations },
      { path: "members", Component: Members },
      { path: "activity", Component: ActivityLog },
    ],
  },
]);