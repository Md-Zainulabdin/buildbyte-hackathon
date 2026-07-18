import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LandingPage from "./pages/LandingPage";
import AuthCallback from "./pages/AuthCallback";
import CreateProfile from "./pages/CreateProfile";
import PostOpportunity from "./pages/PostOpportunity";
import OpportunityFeed from "./pages/OpportunityFeed";
import Applications from "./pages/Applications";
import CompletedTask from "./pages/CompletedTask";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile/create" element={<CreateProfile />} />
            <Route path="/opportunities/new" element={<PostOpportunity />} />
            <Route path="/opportunities" element={<OpportunityFeed />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/tasks/:id/review" element={<CompletedTask />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
