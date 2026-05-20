import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Authlayout } from './layouts/Authlayout';
import { ChatLayout } from './layouts/ChatLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ChatPage } from './pages/chat/ChatPage';
import { NotificationsPage } from './pages/chat/NotificationsPage';
import { Settings, User, Radio, Users, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { logout } from './app/authSlice';
import { WebSocketProvider } from './context/webSocketContext';

// Sub-layout wrapper that acts as the protected routing parent
const MainAppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Map route patterns to active tabs
  let activeTab = 'chats';
  const path = location.pathname;
  if (path.startsWith('/notifications')) activeTab = 'notifications';
  else if (path.startsWith('/status')) activeTab = 'status';
  else if (path.startsWith('/groups')) activeTab = 'groups';
  else if (path.startsWith('/ai')) activeTab = 'ai';
  else if (path.startsWith('/settings')) activeTab = 'settings';
  else if (path.startsWith('/profile')) activeTab = 'profile';

  const handleSetActiveTab = (tab: string) => {
    if (tab === 'chats') {
      navigate('/chat');
    } else {
      navigate(`/${tab}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <ChatLayout
      activeTab={activeTab}
      setActiveTab={handleSetActiveTab}
      unreadCount={45}
      notificationCount={2}
      onLogout={handleLogout}
    >
      <Outlet />
    </ChatLayout>
  );
};

// Login Route Wrapper to allow useNavigate()
const LoginRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  if (currentUser) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <Authlayout 
      title="ChatApp" 
      subtitle="Sign in to explore the gorgeous Navy Blue theme interface."
    >
      <Login 
        onNavigateToRegister={() => navigate('/register')} 
      />
    </Authlayout>
  );
};

// Register Route Wrapper to allow useNavigate()
const RegisterRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  if (currentUser) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <Authlayout 
      title="ChatApp Workspace" 
      subtitle="Join the communication portal and customize your dashboard profile."
    >
      <Register 
        onNavigateToLogin={() => navigate('/login')} 
      />
    </Authlayout>
  );
};

// Profile Page Component utilizing Redux dispatch for logout actions
const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex-1 bg-[#0b0f19] flex flex-col items-center justify-center p-8 select-none animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-100 mb-8 flex items-center gap-2">
        <User className="w-6 h-6 text-sky-400" /> Profile Details
      </h2>
      <div className="glassmorphism p-8 rounded-3xl border border-slate-800 w-full max-w-sm text-center flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-slate-750 border-4 border-slate-800 overflow-hidden mb-4 shadow-xl">
          <img 
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
            alt="Profile" 
            className="w-full h-full object-cover" 
          />
        </div>
        <h3 className="text-lg font-bold text-slate-200 capitalize">{currentUser?.name || 'User'}</h3>
        <p className="text-slate-400 text-xs mt-1">{currentUser?.email || 'user@example.com'}</p>
        <div className="w-full h-px bg-slate-800/80 my-6" />
        <button 
          onClick={handleLogout}
          className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 font-semibold text-xs rounded-xl transition-all duration-150 cursor-pointer"
        >
          Log Out Profile
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Paths */}
          <Route 
            path="/login" 
            element={<LoginRouteWrapper />} 
          />
          <Route 
            path="/register" 
            element={<RegisterRouteWrapper />} 
          />

          {/* Nested App Layout Router */}
          <Route element={<MainAppLayout />}>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            
            <Route 
              path="/status" 
              element={
                <div className="flex-1 bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                  <Radio className="w-16 h-16 text-indigo-400 mb-4 animate-pulse" />
                  <h2 className="text-xl font-bold text-slate-200">Status Updates</h2>
                  <p className="text-slate-400 text-xs mt-2 max-w-sm">
                    See what your contacts are sharing in real-time. This feature will update once your contacts publish media.
                  </p>
                </div>
              } 
            />

            <Route 
              path="/groups" 
              element={
                <div className="flex-1 bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                  <Users className="w-16 h-16 text-sky-400 mb-4" />
                  <h2 className="text-xl font-bold text-slate-200">Workspaces & Groups</h2>
                  <p className="text-slate-400 text-xs mt-2 max-w-sm">
                    Create spaces for team collaboration, group channels, or project discussions.
                  </p>
                </div>
              } 
            />

            <Route 
              path="/ai" 
              element={
                <div className="flex-1 bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                  <div className="p-4 bg-violet-950/40 rounded-3xl border border-violet-900/30 mb-4 animate-bounce">
                    <Sparkles className="w-12 h-12 text-violet-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-200">Meta AI Assistant</h2>
                  <p className="text-slate-400 text-xs mt-2 max-w-sm">
                    Your personalized workspace AI is ready. You can query code solutions, write documentation, or automate tasks.
                  </p>
                </div>
              } 
            />

            <Route 
              path="/settings" 
              element={
                <div className="flex-1 bg-[#0b0f19] flex flex-col p-8 select-none overflow-y-auto animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-sky-400" /> Settings
                  </h2>
                  <div className="max-w-xl space-y-4">
                    <div className="glassmorphism p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <h3 className="text-[13.5px] font-bold text-slate-200">Dark/Navy Mode</h3>
                        <p className="text-slate-500 text-[11px] mt-0.5">Toggle interface design palettes.</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-950/40 border border-sky-900/30 px-2.5 py-1 rounded-full">
                        Enabled
                      </span>
                    </div>
                    <div className="glassmorphism p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <h3 className="text-[13.5px] font-bold text-slate-200">Push Notifications</h3>
                        <p className="text-slate-500 text-[11px] mt-0.5">Alert sound on incoming chat requests.</p>
                      </div>
                      <button className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1 rounded-full cursor-pointer">
                        Muted
                      </button>
                    </div>
                  </div>
                </div>
              } 
            />

            <Route 
              path="/profile" 
              element={<ProfilePage />} 
            />
          </Route>

          {/* Fallback routing to chat page */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}