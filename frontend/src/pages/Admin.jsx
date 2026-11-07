import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "./Subscriptions.css";
import "./Admin.css";

const ADMIN_SESSION_KEY = "interviewiqAdminPassword";

export default function Admin() {
  const navigate = useNavigate();
  const password = sessionStorage.getItem(ADMIN_SESSION_KEY) || "";

  useEffect(() => {
    if (!password) navigate("/admin/login", { replace: true });
  }, [navigate, password]);

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    navigate("/admin/login", { replace: true });
  };

  if (!password) return null;
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <Link className="admin-brand" to="/admin"><span>INTERVIEWIQ</span><small>ADMINISTRATION</small></Link>
        <div className="admin-nav-group">
          <p>Manage</p>
          <NavLink end className={({ isActive }) => `admin-nav-link${isActive ? " is-active" : ""}`} to="/admin"><span aria-hidden="true">▦</span>Overview</NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? " is-active" : ""}`} to="/admin/users"><span aria-hidden="true">♙</span>Users</NavLink>
          <NavLink className={({ isActive }) => `admin-nav-link${isActive ? " is-active" : ""}`} to="/admin/subscriptions"><span aria-hidden="true">▤</span>Subscriptions</NavLink>
        </div>
        <div className="admin-sidebar-bottom"><button className="admin-nav-link" type="button" onClick={logout}><span aria-hidden="true">↪</span>Sign Out</button></div>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar"><div><span>INTERVIEWIQ</span><strong>Admin Panel</strong></div><div className="admin-profile"><span>Administrator</span><b>Admin</b></div></div>
        <Outlet context={{ password }} />
      </div>
    </div>
  );
}
