import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username")?.trim();
  const email = localStorage.getItem("email") || "";
  const isLoggedIn = Boolean(username || email);
  const displayName = username || email.split("@")[0] || "User";
  const initial = displayName.charAt(0).toLocaleUpperCase() || "U";
  let subscription = null;
  try { subscription = JSON.parse(localStorage.getItem("subscription") || "null"); } catch { subscription = null; }
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    sessionStorage.removeItem("interviewiqAdminPassword");
    navigate("/login");
  };
  const styles = `
    .site-navbar { width:100%; min-height:68px; padding:12px 28px; display:flex; align-items:center; justify-content:space-between; gap:24px; background:#fff; border-bottom:1px solid #e5e5e5; position:sticky; top:0; z-index:10; }
    .navbar-brand { display:flex; align-items:center; gap:10px; color:#171717; text-decoration:none; font-size:19px; font-weight:700; white-space:nowrap; margin-right:auto; }\r\n    .navbar-brand-mark { width:30px; height:30px; flex:none; color:#171717; }
    .site-navbar .navbar-brand,.site-navbar .navbar-links a,.site-navbar .navbar-login,.site-navbar .navbar-signup { text-transform:uppercase; }
    .navbar-links { display:flex; align-items:center; justify-content:center; gap:24px; border:0 !important; box-shadow:none !important; }
    .navbar-links a,.navbar-login { color:#333; text-decoration:none; font-size:16px; font-weight:500; border:0 !important; box-shadow:none !important; }
    .navbar-links a:hover,.navbar-login:hover { color:#777; }
    .navbar-account { display:flex; align-items:center; gap:12px; white-space:nowrap; margin-left:auto; }
    .navbar-login { padding:9px 14px; border:1px solid #d4d4d4 !important; border-radius:8px; }
    .navbar-signup,.navbar-button { padding:9px 15px; border:1px solid #171717; border-radius:8px; background:#171717; color:#fff !important; text-decoration:none; font-family:inherit; font-size:14px; font-weight:500; cursor:pointer; }
    .navbar-signup { border-color:#d4d4d4 !important; background:#fff !important; color:#171717 !important; }
    .navbar-signup:hover { background:#f5f5f5; }
    .navbar-button:hover { background:#333; }
    .account-menu { position:relative; }
    .account-menu summary { list-style:none; cursor:pointer; }
    .account-menu summary::-webkit-details-marker { display:none; }
    .account-avatar { width:42px; height:42px; display:grid; place-items:center; border:1px solid #dedbd7; border-radius:50%; background:#f7f6f3; color:#171717; font-size:17px; font-weight:600; }
    .account-menu[open] .account-avatar,.account-avatar:hover { background:#efeeeb; }
    .account-popover { position:absolute; top:calc(100% + 12px); right:0; width:min(300px,calc(100vw - 32px)); padding:18px; border:1px solid #e5e5e5; border-radius:14px; background:#fff; box-shadow:0 12px 32px rgba(0,0,0,.12); color:#171717; }
    .account-popover h2 { margin:0 0 14px; font-size:16px; }
    .account-detail { margin:11px 0; overflow-wrap:anywhere; }
    .account-detail-label { display:block; margin-bottom:3px; color:#777; font-size:12px; }
    .account-detail-value { font-size:14px; }
    .account-logout { width:100%; margin-top:8px; }
    .account-manage { display:block; margin-top:12px; color:#171717; font-size:13px; font-weight:600; text-decoration:underline; text-underline-offset:3px; }
    @media(max-width:900px) { .site-navbar { flex-wrap:wrap; justify-content:center; padding:14px; } .navbar-brand { width:100%; text-align:center; } .navbar-links { flex-wrap:wrap; gap:14px; } .navbar-account { margin-left:0; } }
    @media(max-width:500px) { .navbar-links { gap:10px; } .navbar-links a { font-size:12px; } }
  `;
  return <><style>{styles}</style><header className="site-navbar">
    <Link to="/" className="navbar-brand"><svg className="navbar-brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M16 2.5h8v5a13 13 0 0 1 3.5 1.4l4.3-2.4 4 7-4.2 2.4a12 12 0 0 1 0 4.1l4.2 2.4-4 7-4.3-2.4a13 13 0 0 1-3.5 1.4v5h-8v-5a13 13 0 0 1-3.5-1.4l-4.3 2.4-4-7 4.2-2.4a12 12 0 0 1 0-4.1l-4.2-2.4 4-7 4.3 2.4A13 13 0 0 1 16 7.5v-5Z" fill="currentColor"/><circle cx="20" cy="18.5" r="8" fill="#fff"/><path d="m7.5 15.8 12.8-6 12.3 6-12.3 6-12.8-6Z" fill="currentColor"/><path d="M12.1 18v5.1c4.8 3.8 10.4 3.8 15.2 0V18l-7.1 3.4L12.1 18Z" fill="currentColor"/><path d="M32.5 16v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="32.5" cy="24.3" r="1.4" fill="currentColor"/></svg><span>InterviewIQ</span></Link>
    <nav className="navbar-links" aria-label="Main navigation"><Link to="/">Home</Link><Link to="/product-companies">Product Companies</Link><Link to="/service-companies">Service Companies</Link><Link to="/coding">Coding Practice</Link><Link to="/subscriptions">Plans</Link></nav>
    <div className="navbar-account">{isLoggedIn ? <details className="account-menu"><summary aria-label="Open account details"><span className="account-avatar" aria-hidden="true">{initial}</span></summary><section className="account-popover" aria-label="Account details"><h2>Account</h2><div className="account-detail"><span className="account-detail-label">Name</span><span className="account-detail-value">{displayName}</span></div><div className="account-detail"><span className="account-detail-label">Email</span><span className="account-detail-value">{email || "Not available"}</span></div><div className="account-detail"><span className="account-detail-label">Subscription</span><span className="account-detail-value">{subscription?.name || "Free plan"}</span></div>{subscription?.category && <div className="account-detail"><span className="account-detail-label">Category</span><span className="account-detail-value">{subscription.category}</span></div>}<Link className="account-manage" to="/progress">View progress dashboard</Link><Link className="account-manage" to="/account/subscription">View subscription details</Link><button type="button" className="navbar-button account-logout" onClick={handleLogout}>Log out</button></section></details> : <><Link className="navbar-login" to="/login">Login</Link><Link className="navbar-signup" to="/signup">Sign Up</Link></>}</div>
  </header></>;
}
export default Navbar;

