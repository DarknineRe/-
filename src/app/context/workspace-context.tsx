import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./auth-context";

export interface Workspace {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  createdAt: Date;
  members: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "employee";
  joinedAt: Date;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string) => void;
  joinWorkspace: (code: string) => boolean;
  inviteToWorkspace: (workspaceId: string, email: string) => void;
  getUserRole: () => "owner" | "employee" | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Generate random 6-digit code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load workspaces from localStorage
    const savedWorkspaces = localStorage.getItem("workspaces");
    if (savedWorkspaces) {
      try {
        const parsed = JSON.parse(savedWorkspaces);
        // Convert date strings back to Date objects
        const workspacesWithDates = parsed.map((ws: any) => ({
          ...ws,
          createdAt: new Date(ws.createdAt),
          members: ws.members.map((m: any) => ({
            ...m,
            joinedAt: new Date(m.joinedAt),
          })),
        }));
        setWorkspaces(workspacesWithDates);
      } catch (e) {
        console.error("Failed to parse workspaces from localStorage", e);
      }
    }

    // Load current workspace
    const savedCurrentWorkspace = localStorage.getItem("currentWorkspace");
    if (savedCurrentWorkspace) {
      try {
        const parsed = JSON.parse(savedCurrentWorkspace);
        setCurrentWorkspace({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          members: parsed.members.map((m: any) => ({
            ...m,
            joinedAt: new Date(m.joinedAt),
          })),
        });
      } catch (e) {
        console.error("Failed to parse currentWorkspace from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    // Save workspaces to localStorage
    if (workspaces.length > 0) {
      localStorage.setItem("workspaces", JSON.stringify(workspaces));
    }
  }, [workspaces, isLoaded]);

  useEffect(() => {
    // Save current workspace to localStorage
    if (currentWorkspace) {
      localStorage.setItem("currentWorkspace", JSON.stringify(currentWorkspace));
    }
  }, [currentWorkspace]);

  const createWorkspace = (name: string) => {
    if (!user) return;

    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name,
      code: generateCode(),
      ownerId: user.id,
      createdAt: new Date(),
      members: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    };

    setWorkspaces([...workspaces, newWorkspace]);
    setCurrentWorkspace(newWorkspace);
  };

  const joinWorkspace = (code: string): boolean => {
    if (!user) return false;

    const workspace = workspaces.find((ws) => ws.code === code.toUpperCase());
    if (!workspace) return false;

    // Check if user is already a member
    const isMember = workspace.members.some((m) => m.id === user.id);
    if (isMember) {
      setCurrentWorkspace(workspace);
      return true;
    }

    // Add user as employee
    const updatedWorkspace: Workspace = {
      ...workspace,
      members: [
        ...workspace.members,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "employee",
          joinedAt: new Date(),
        },
      ],
    };

    setWorkspaces(
      workspaces.map((ws) => (ws.id === workspace.id ? updatedWorkspace : ws))
    );
    setCurrentWorkspace(updatedWorkspace);
    return true;
  };

  const inviteToWorkspace = (workspaceId: string, email: string) => {
    // Mock invite - in real app, this would send an email
    console.log(`Invited ${email} to workspace ${workspaceId}`);
  };

  const getUserRole = (): "owner" | "employee" | null => {
    if (!user || !currentWorkspace) return null;
    const member = currentWorkspace.members.find((m) => m.id === user.id);
    return member?.role || null;
  };

  // Filter workspaces to show only those where user is a member
  const userWorkspaces = workspaces.filter((ws) =>
    ws.members.some((m) => m.id === user?.id)
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: userWorkspaces,
        currentWorkspace,
        setCurrentWorkspace,
        createWorkspace,
        joinWorkspace,
        inviteToWorkspace,
        getUserRole,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
