import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import { useWorkspace } from "../context/workspace-context";

export function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!currentWorkspace) {
      navigate("/hub");
    }
  }, [isAuthenticated, currentWorkspace, navigate]);

  if (!isAuthenticated || !currentWorkspace) {
    return null;
  }

  return <Outlet />;
}
