import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { useNavigate, useLocation } from "react-router";
import { AuthProvider, useAuth } from "./context/auth-context";
import { WorkspaceProvider, useWorkspace } from "./context/workspace-context";
import { DataProvider } from "./context/data-context";
import { router } from "./routes";
import { Toaster } from "sonner";

// Component to handle redirects
function AppContent() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
