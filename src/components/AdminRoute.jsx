import { Navigate } from "react-router-dom";
import { useSession } from "../session";

export default function AdminRoute({ children }) {
  const { session } = useSession();
  return session.scopes?.includes("telegram:claims:read") ? children : <Navigate to="/app/dashboard" replace />;
}
