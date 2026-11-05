import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";

function Footer() {
  return (
    <footer className="app-footer">
      <p>InterviewIQ | Interview preparation and coding practice</p>
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

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/subscription/checkout/:planCode" element={<DemoCheckout />} />
            <Route path="/account/subscription" element={<AccountSubscription />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />

            <Route
              path="/product-companies"
              element={<ProductCompanies />}
            />
            <Route
              path="/service-companies"
              element={<ServiceCompanies />}
            />
            <Route
              path="/company/:name"
              element={<CompanyDetails />}
            />

            <Route
              path="/interview/:name"
              element={<InterviewPractice />}
            />
            <Route path="/coding" element={<CodingPractice />} />
            <Route path="/report" element={<Report />} />

            <Route
              path="/practice/:company/:module"
              element={<PracticeWorkspace />}
            />

            <Route path="/companies" element={<Navigate to="/product-companies" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
