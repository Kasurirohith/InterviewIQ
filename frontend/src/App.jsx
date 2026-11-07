import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import CodingPractice from "./components/CodingPractice";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Report from "./pages/Report";
import CompanyDetails from "./pages/CompanyDetails";
import ProductCompanies from "./pages/ProductCompanies";
import ServiceCompanies from "./pages/ServiceCompanies";
import InterviewPractice from "./pages/InterviewPractice";
import PracticeWorkspace from "./pages/PracticeWorkspace";
import Subscriptions from "./pages/Subscriptions";
import DemoCheckout from "./pages/DemoCheckout";
import AccountSubscription from "./pages/AccountSubscription";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link to="/" className="footer-brand">InterviewIQ</Link>
          <p>Prepare with purpose. Progress with practice.</p>
        </div>
        <div className="footer-column">
          <h2>Explore</h2>
          <Link to="/product-companies">Product companies</Link>
          <Link to="/service-companies">Service companies</Link>
          <Link to="/coding">Coding practice</Link>
        </div>
        <div className="footer-column">
          <h2>Your account</h2>
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Create account</Link>
          <Link to="/subscriptions">Plans</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} InterviewIQ</span>
        <span>Interview preparation and coding practice</span>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <section className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <button type="button" onClick={() => window.location.assign("/")}>
        Back to Home
      </button>
    </section>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
      <div className={`app-layout${isAdminRoute ? " app-layout-admin" : ""}`}>
        {!isAdminRoute && <Navbar />}
        <main className={`app-main${isAdminRoute ? " app-main-admin" : ""}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/subscription/checkout/:planCode" element={<DemoCheckout />} />
            <Route path="/account/subscription" element={<AccountSubscription />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/product-companies" element={<ProductCompanies />} />
            <Route path="/service-companies" element={<ServiceCompanies />} />
            <Route path="/company/:name" element={<CompanyDetails />} />
            <Route path="/interview/:name" element={<InterviewPractice />} />
            <Route path="/coding" element={<CodingPractice />} />
            <Route path="/report" element={<Report />} />
            <Route path="/practice/:company/:module" element={<PracticeWorkspace />} />
            <Route path="/companies" element={<Navigate to="/product-companies" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
