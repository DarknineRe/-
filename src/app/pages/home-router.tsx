import { useWorkspace } from "../context/workspace-context";
import { Dashboard } from "./dashboard";
import { BuyerShop } from "./buyer-shop";

export function HomeRouter() {
  const { getUserRole, getUserPermissions } = useWorkspace();
  const role = getUserRole();
  const permissions = getUserPermissions();

  const isBuyer = role !== "owner" && !permissions.canAdd;

  if (isBuyer) {
    return <BuyerShop />;
  }

  return <Dashboard />;
}
