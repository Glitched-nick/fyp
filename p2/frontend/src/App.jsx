import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

const PremiumLanding = lazy(() => import('./pages/PremiumLanding'))
const SimpleLanding = lazy(() => import('./pages/SimpleLanding'))
const FinalLanding = lazy(() => import('./pages/FinalLanding'))
const EnhancedLanding = lazy(() => import('./pages/EnhancedLanding'))
const Landing = lazy(() => import('./pages/Landing'))
const LiveInterview = lazy(() => import('./pages/LiveInterview'))
const Upload = lazy(() => import('./pages/Upload'))
const VideoUpload = lazy(() => import('./pages/VideoUpload'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Home = lazy(() => import('./pages/Home'))
const Results = lazy(() => import('./pages/Results'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const FirebaseLogin = lazy(() => import('./pages/FirebaseLogin'))
const FirebaseSignup = lazy(() => import('./pages/FirebaseSignup'))
const Profile = lazy(() => import('./pages/Profile'))
const TestUpload = lazy(() => import('./pages/TestUpload'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const CookiePage = lazy(() => import('./pages/CookiePage'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const Pricing = lazy(() => import('./pages/Pricing'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const Settings = lazy(() => import('./pages/Settings'))
const InterviewSelection = lazy(() => import('./pages/InterviewSelection'))
const InterviewResults = lazy(() => import('./features/live-interview/pages/InterviewResults'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <Router>
      <AuthProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-black"
        >
          Skip to main content
        </a>
        <main id="main-content" role="main">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                Loading...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<PremiumLanding />} />
              <Route path="/simple" element={<SimpleLanding />} />
              <Route path="/polished" element={<FinalLanding />} />
              <Route path="/enhanced" element={<EnhancedLanding />} />
              <Route path="/classic" element={<Landing />} />
              <Route path="/interview-selection" element={<InterviewSelection />} />
              <Route path="/interview" element={<Navigate to="/interview-selection" replace />} />
              <Route path="/ai-interview-setup" element={<Navigate to="/interview-selection" replace />} />
              <Route path="/live-interview" element={<LiveInterview />} />
              <Route path="/interview-results" element={<InterviewResults />} />
              <Route path="/interview-results/:sessionId" element={<InterviewResults />} />
              <Route path="/home" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/video-upload" element={<VideoUpload />} />
              <Route path="/test-upload" element={<TestUpload />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/results" element={<Navigate to="/dashboard" replace />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/firebase-login" element={<FirebaseLogin />} />
              <Route path="/firebase-signup" element={<FirebaseSignup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiePage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/careers" element={<ComingSoon title="Careers" />} />
              <Route path="/blog" element={<ComingSoon title="Blog" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </AuthProvider>
    </Router>
  )
}

export default App
