import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LogManager from './components/LogManager';
import EventStream from './components/EventStream';
import ThreatMonitor from './components/ThreatMonitor';
import IncidentWorkspace from './components/IncidentWorkspace';
import ReportManager from './components/ReportManager';
import AuditLogManager from './components/AuditLogManager';
import SettingsPage from './components/SettingsPage';
import LandingPage from './components/LandingPage';
import AgentStatusConsole from './components/AgentStatusConsole';
import DetectionRules from './components/DetectionRules';
import ThreatIntel from './components/ThreatIntel';
import RiskWorkbench from './components/RiskWorkbench';
import AiArchitecture from './components/AiArchitecture';
import DataIngestion from './components/DataIngestion';

import TourProvider, { useTour } from './components/TourProvider';
import WelcomeModal from './components/WelcomeModal';
import DemoScenarioModal from './components/DemoScenarioModal';

import { Shield, Lock, User, Key, FileCheck, RefreshCw, KeyRound } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <TourProvider>
        <AppContent />
      </TourProvider>
    </Router>
  );
}

function IncidentWorkspaceWrapper({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  return <IncidentWorkspace token={token} incidentId={id} onBack={() => navigate('/incidents')} />;
}

function AppContent() {
  const { restartTour } = useTour();
  const [token, setToken] = useState(localStorage.getItem('soc_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('soc_user')) || null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Operational mode: 'security' or 'fintech'
  const [mode, setMode] = useState(localStorage.getItem('soc_mode') || 'security');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  
  // Guest routing state: 'landing' | 'auth'
  const [viewMode, setViewMode] = useState('landing');
  
  // Auth sub-modes: 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'
  const [authMode, setAuthMode] = useState('login');
  const [pendingEmail, setPendingEmail] = useState('');
  
  // Forms inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('analyst');
  const [otp, setOtp] = useState('');
  
  // Profile settings inputs
  const [oldPasswordProfile, setOldPasswordProfile] = useState('');
  const [newPasswordProfile, setNewPasswordProfile] = useState('');
  const [confirmPasswordProfile, setConfirmPasswordProfile] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('soc_token', token);
    } else {
      localStorage.removeItem('soc_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('soc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('soc_user');
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        console.warn('Session expired or unauthorized. Logging out.');
        handleLogout();
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    navigate('/dashboard');
    setViewMode('landing');
    setAuthMode('login');
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, confirmPassword, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed.');

        if (!data.isVerified) {
          setPendingEmail(data.email);
          setAuthMode('verify-otp');
          setSuccess('Account created! A 6-digit verification code has been dispatched to your email.');
          setError('');
          return;
        }

        setToken(data.token);
        setUser({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: 'Active',
          createdAt: new Date()
        });
      } 
      
      else if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.status === 403 && !data.isVerified) {
          setPendingEmail(data.email);
          setSuccess(data.message || 'Verification required. A code has been sent to your email.');
          setError('');
          setAuthMode('verify-otp');
          return;
        }

        if (!res.ok) throw new Error(data.message || 'Authentication failed.');

        setToken(data.token);
        setUser({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          lastLogin: data.lastLogin,
          createdAt: data.createdAt
        });
      }

      else if (authMode === 'verify-otp') {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: pendingEmail, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'OTP verification failed.');

        setToken(data.token);
        setUser({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          lastLogin: data.lastLogin,
          createdAt: data.createdAt
        });
        setOtp('');
      }

      else if (authMode === 'forgot-password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Forgot password failed.');

        setSuccess(data.message);
        setAuthMode('reset-password');
        setPendingEmail(email);
      }

      else if (authMode === 'reset-password') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: pendingEmail, otp, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Reset password failed.');

        setSuccess(data.message);
        setAuthMode('login');
        setOtp('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP resend failed.');
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePasswordProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPasswordProfile !== confirmPasswordProfile) {
      setError('New passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          email: user.email, 
          oldPassword: oldPasswordProfile, 
          password: newPasswordProfile 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password update failed.');

      setSuccess('Password updated successfully.');
      setOldPasswordProfile('');
      setNewPasswordProfile('');
      setConfirmPasswordProfile('');
    } catch (err) {
      setError(err.message);
    }
  };

  // ---------------------------------------------
  // GUEST SHELL: LANDING & AUTH VIEWS
  // ---------------------------------------------
  if (!token) {
    if (viewMode === 'landing') {
      return (
        <LandingPage 
          onNavigateToAuth={(mode = 'login') => {
            setAuthMode(mode);
            setViewMode('auth');
          }} 
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 font-mono text-xs select-none">
        <div className="w-full max-w-md bg-[#111827] border border-slate-800 p-8 rounded-lg space-y-6 shadow-2xl">
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded bg-[#06B6D4]/15 border border-[#06B6D4]/45 flex items-center justify-center text-[#06B6D4]">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              AEGIS // WORKSTATION
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
              AI Risk Intelligence Platform
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase font-semibold">Analyst Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-[#06B6D4] transition"
                  />
                </div>
              </div>
            )}

            {(authMode === 'register' || authMode === 'login' || authMode === 'forgot-password') && (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase font-semibold">Analyst Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-[#06B6D4] transition"
                  />
                </div>
              </div>
            )}

            {(authMode === 'login' || authMode === 'register' || authMode === 'reset-password') && (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase font-semibold">
                  {authMode === 'reset-password' ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-[#06B6D4] transition"
                  />
                </div>
              </div>
            )}

            {authMode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold">Confirm Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Confirm password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-[#06B6D4] transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold">Enrolled Role Tier</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-800 rounded px-3 py-2 text-slate-300 focus:outline-none focus:border-[#06B6D4]"
                  >
                    <option value="viewer">Tier-1 Viewer (Read Only)</option>
                    <option value="analyst">Tier-2 Analyst (Write Notes/Mitigations)</option>
                    <option value="admin">Tier-3 System Administrator (Wipe Data)</option>
                  </select>
                </div>
              </>
            )}

            {(authMode === 'verify-otp' || authMode === 'reset-password') && (
              <div className="space-y-2">
                {pendingEmail && (
                  <div className="p-2.5 rounded bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-slate-300 text-[11px] font-mono flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span>OTP dispatched to: <strong className="text-white">{pendingEmail}</strong></span>
                  </div>
                )}
                <label className="block text-[10px] text-slate-400 uppercase font-semibold">6-Digit Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter code..."
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-[#06B6D4] transition"
                  />
                </div>
                {authMode === 'verify-otp' && (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-[10px] text-[#06B6D4] hover:underline cursor-pointer block mt-1"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="text-[10px] text-[#DC2626] font-semibold font-mono bg-[#DC2626]/10 border border-[#DC2626]/20 p-2.5 rounded">
                [ERROR] {error}
              </div>
            )}
            {success && (
              <div className="text-[10px] text-[#10B981] font-semibold font-mono bg-[#10B981]/10 border border-[#10B981]/20 p-2.5 rounded">
                [SUCCESS] {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#06B6D4] hover:bg-[#06B6D4]/80 text-[#0F172A] py-2 rounded font-bold transition flex items-center justify-center cursor-pointer select-none"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#0F172A]" />
              ) : (
                <span>
                  {authMode === 'login' ? 'ESTABLISH_SESSION' :
                   authMode === 'register' ? 'SUBMIT_ENROLLMENT' :
                   authMode === 'verify-otp' ? 'VERIFY_IDENTITY' :
                   authMode === 'forgot-password' ? 'REQUEST_RESET' :
                   'UPDATE_PASSWORD'}
                </span>
              )}
            </button>
          </form>

          <div className="flex flex-col space-y-1.5 text-center text-[10px] font-mono border-t border-slate-800/80 pt-4 select-none">
            {authMode === 'login' ? (
              <>
                <button onClick={() => { setAuthMode('register'); setError(''); setSuccess(''); }} className="text-[#06B6D4] hover:underline cursor-pointer transition">
                  Request enrollment access key
                </button>
                <button onClick={() => { setAuthMode('forgot-password'); setError(''); setSuccess(''); }} className="text-slate-500 hover:text-white cursor-pointer transition">
                  Recover forgotten credential
                </button>
              </>
            ) : (
              <button 
                onClick={() => { 
                  setAuthMode('login'); 
                  setError(''); 
                  setSuccess(''); 
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }} 
                className="text-slate-500 hover:text-white cursor-pointer transition"
              >
                Return to Login form
              </button>
            )}
            
            <button 
              onClick={() => { setViewMode('landing'); setError(''); setSuccess(''); }}
              className="text-slate-500 hover:text-[#38BDF8] cursor-pointer transition mt-2 border-t border-slate-800 pt-3 flex items-center justify-center gap-1"
            >
              <span>Back to Aegis Landing page</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------
  // AUTHENTICATED WORKSPACE SHELL
  // ---------------------------------------------
  return (
    <div className="min-h-screen bg-[#0F172A] flex text-slate-105 overflow-hidden">
      
      {/* Sidebar navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => navigate(`/${tab}`)}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mode={mode}
        setMode={setMode}
      />

      {/* Main viewport area */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto">
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          activeTab={activeTab} 
          setActiveTab={(tab) => navigate(`/${tab}`)} 
          onOpenTour={restartTour}
        />
        
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl w-full mx-auto pb-12">
          
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 1. Overview Dashboard */}
            <Route path="/dashboard" element={
              <Dashboard 
                token={token} 
                user={user}
                onNavigateToTab={(tab) => navigate(`/${tab}`)}
                mode={mode}
                onOpenDemoLauncher={() => setDemoModalOpen(true)}
                onSelectIncident={(id) => navigate(`/investigations/${id}`)}
              />
            } />

            {/* 2. Data Ingestion Gateway */}
            <Route path="/ingestion" element={
              <DataIngestion 
                token={token} 
                onNavigateToIncident={(id) => navigate(`/investigations/${id}`)}
              />
            } />

            {/* 2.5 Event Stream Log Viewer */}
            <Route path="/event-stream" element={
              <EventStream token={token} />
            } />

            {/* 4. Threats list monitor */}
            <Route path="/incidents" element={
              <ThreatMonitor 
                token={token} 
                onSelectIncident={(id) => navigate(`/investigations/${id}`)} 
                mode={mode}
                onNavigateToTab={(tab) => navigate(`/${tab}`)}
                onOpenDemoLauncher={() => setDemoModalOpen(true)}
              />
            } />

            {/* 5. Active Investigations list */}
            <Route path="/investigations" element={
              <ThreatMonitor 
                token={token} 
                onSelectIncident={(id) => navigate(`/investigations/${id}`)} 
                mode={mode}
              />
            } />

            {/* 3. Incident Workspace details */}
            <Route path="/investigations/:id" element={
              <IncidentWorkspaceWrapper token={token} />
            } />

            {/* 5.5 Threat Intelligence Feed */}
            <Route path="/threat-intel" element={
              <ThreatIntel mode={mode} />
            } />

            {/* 5.8 Detection Rules Page */}
            <Route path="/detection-rules" element={
              <DetectionRules />
            } />

            {/* 5.9 Interactive Risk Workbench */}
            <Route path="/risk-workbench" element={
              <RiskWorkbench />
            } />

            {/* 5.95 AI Architecture Details */}
            <Route path="/ai-architecture" element={
              <AiArchitecture />
            } />

            {/* 6. Incident reports manager */}
            <Route path="/reports" element={
              <ReportManager token={token} />
            } />

            {/* 7. Security audit event trails */}
            <Route path="/audit-logs" element={
              <AuditLogManager token={token} />
            } />

            {/* 8. Agent executions console log */}
            <Route path="/agent-activity" element={
              <AgentStatusConsole />
            } />

            {/* 9. Profile settings */}
            <Route path="/profile" element={
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-lg space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">ANALYST_PROFILE_WORKSPACE</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Details and password configuration for user {user.name}.</p>
                </div>

                {/* Grid profile data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase">Profile Identifier</span>
                    <span className="text-white block font-bold">{user.id}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase">Security Email</span>
                    <span className="text-slate-350 block font-bold">{user.email}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase">Access role tier</span>
                    <span className="text-white block font-bold uppercase">{user.role}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase">Account Status</span>
                    <span className="text-[#10B981] block font-bold">ACTIVE</span>
                  </div>
                </div>

                {/* Password update form */}
                <form onSubmit={handleChangePasswordProfileSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-4 max-w-md">
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center">
                    <KeyRound className="w-4 h-4 mr-2 text-[#06B6D4]" /> Reset Security Password
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">Current Password</label>
                    <input
                      type="password"
                      required
                      value={oldPasswordProfile}
                      onChange={(e) => setOldPasswordProfile(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4] font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPasswordProfile}
                      onChange={(e) => setNewPasswordProfile(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4] font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono text-slate-400 uppercase">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPasswordProfile}
                      onChange={(e) => setConfirmPasswordProfile(e.target.value)}
                      className="w-full bg-[#111827] border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-[#06B6D4] font-mono"
                    />
                  </div>

                  {success && <div className="text-[10px] text-[#10B981] font-mono">[OK] {success}</div>}
                  {error && <div className="text-[10px] text-[#DC2626] font-mono">[ERROR] {error}</div>}

                  <button
                    type="submit"
                    className="bg-[#06B6D4] hover:bg-[#06B6D4]/85 transition px-4 py-2 text-xs font-mono text-[#0F172A] font-bold rounded cursor-pointer"
                  >
                    UPDATE_PASSWORD
                  </button>
                </form>
              </div>
            } />

            {/* 10. Settings Configuration Page */}
            <Route path="/settings" element={
              <SettingsPage token={token} onLogout={handleLogout} />
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Demo scenario launcher modal */}
      <DemoScenarioModal 
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        token={token}
        onNavigateToIncident={(id) => navigate(`/investigations/${id}`)}
      />

      {/* Onboarding Welcome Modal */}
      <WelcomeModal />
    </div>
  );
}
