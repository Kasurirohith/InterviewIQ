import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { loadAdminUsers } from "../services/subscriptions";

function suggestion(user) {
  if (user.next_suggestion) return user.next_suggestion;
  if (!user.interview_count) return "Start a mock interview";
  if (Number(user.average_score) < 60) return "Review feedback and practice again";
  if (user.interview_count < 5) return "Continue mock interview practice";
  return "Try a company-specific preparation track";
}

export default function AdminUsers() {
  const { password } = useOutletContext();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => loadAdminUsers(password, search).then((result) => {
      if (active) setUsers(result.users || []);
    }).catch((e) => { if (active) setError(e.message); }), 180);
    return () => { active = false; clearTimeout(timer); };
  }, [password, search]);

  return <main className="subscription-page admin-page">
    <header className="admin-header"><div><p className="subscription-eyebrow">INTERVIEWIQ ADMIN CONSOLE</p><h1>Users</h1><p className="subscription-lead">Search members, review interview activity and plan access, and see a suggested next step.</p></div></header>
    <section className="admin-controls admin-users-search"><label><span>Search Users</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email" /></label></section>
    {error && <p className="subscription-error" role="alert">{error}</p>}
    <p className="admin-user-count">{users.length} user{users.length === 1 ? "" : "s"} shown</p>
    {users.length ? <div className="admin-table-wrap"><table className="admin-users-table"><thead><tr><th>User</th><th>Interview Activity</th><th>Plan Access</th><th>Next Suggestion</th></tr></thead><tbody>
      {users.map((user) => <tr key={user.id}><td><strong>{user.name || "Unnamed User"}</strong><span>{user.email}</span></td><td>{user.interview_count} interview{user.interview_count === 1 ? "" : "s"}<span>{user.last_interview_at ? `Last: ${user.last_interview_at}` : "No interviews yet"}{user.average_score != null ? ` · Avg. ${user.average_score}%` : ""}</span>{user.focus_area && <span>Focus: {user.focus_area}</span>}</td><td>{user.plan_name || "No Plan"}<span>{user.subscription_status || "No Subscription"}</span></td><td>{suggestion(user)}</td></tr>)}
    </tbody></table></div> : <section className="admin-empty">No users found.</section>}
  </main>;
}

