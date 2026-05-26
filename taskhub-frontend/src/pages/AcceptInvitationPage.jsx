import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { invitationApi } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { LayoutDashboard, Mail, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, UserPlus, LogIn, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, login: contextLogin, register: contextRegister, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [invitation, setInvitation] = useState(null);

  // Forms state
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const validateToken = async () => {
    if (!token) {
      setError('Missing invitation token.');
      setValidating(false);
      setLoading(false);
      return;
    }

    try {
      setValidating(true);
      setError('');
      const res = await invitationApi.validateToken(token);
      setInvitation(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid or expired invitation token.');
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    validateToken();
  }, [token]);

  const handleAcceptLoggedIn = async () => {
    setFormLoading(true);
    setFormError('');
    try {
      await invitationApi.accept(token);
      toast.success(`Welcome to ${invitation.organizationName}!`);
      
      // Redirect to dashboard, which will load the updated organizations
      navigate('/dashboard', { replace: true });
      window.location.reload(); // Force reload to pull newly joined org
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to accept invitation.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignupAndJoin = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setFormError('Name is required'); return; }
    if (!password || password.length < 6) { setFormError('Password must be at least 6 characters'); return; }
    setFormError('');
    setFormLoading(true);

    try {
      // 1. Sign Up
      const signupSuccess = await contextRegister(name, invitation.email, password);
      if (!signupSuccess) {
        throw new Error('Registration failed');
      }

      // 2. Log In
      const loginSuccess = await contextLogin(invitation.email, password);
      if (!loginSuccess) {
        throw new Error('Login failed');
      }

      // 3. Accept invitation
      // Since registration auto-accepts invitation on the backend (in our updated AuthServiceImpl.register),
      // we can verify or directly redirect!
      toast.success(`Successfully joined ${invitation.organizationName}!`);
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to complete registration flow');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLoginAndJoin = async (e) => {
    e.preventDefault();
    if (!password) { setFormError('Password is required'); return; }
    setFormError('');
    setFormLoading(true);

    try {
      // 1. Log In
      const loginSuccess = await contextLogin(invitation.email, password);
      if (!loginSuccess) {
        throw new Error('Incorrect password or login failed');
      }

      // 2. Accept Invitation
      await invitationApi.accept(token);
      toast.success(`Successfully joined ${invitation.organizationName}!`);
      
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Authentication failed');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500 mb-4" />
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Verifying secure invitation token...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <Card className="w-full max-w-md border-rose-200 dark:border-rose-950 bg-white dark:bg-gray-900 shadow-xl rounded-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl text-gray-950 dark:text-white font-bold">Invitation Error</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-2">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 text-center">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/login')}
              className="w-full text-xs font-bold"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isUserMatchingInvite = user && user.email.toLowerCase() === invitation?.email.toLowerCase();

  return (
    <div className="min-h-screen flex w-full">
      {/* Brand Sidebar */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-600 to-brand-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent)]" />
        <div className="flex items-center gap-2 z-10">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskHub</span>
        </div>
        
        <div className="z-10">
          <h1 className="text-4xl font-extrabold mb-6 leading-tight">
            Collaborate. Track.<br />Succeed together.
          </h1>
          <p className="text-brand-100 text-lg max-w-md leading-relaxed">
            Welcome to TaskHub. Accept your team invitation to join the shared workspace and collaborate on tasks, progress boards, and analytics in real-time.
          </p>
        </div>
        
        <div className="text-xs text-brand-200 z-10">
          © 2026 TaskHub Inc. All rights reserved.
        </div>
      </div>

      {/* Acceptance Workspaces panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TaskHub</span>
          </div>

          <Card className="border border-gray-200/60 dark:border-gray-850 shadow-xl bg-white dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 sm:p-6">
            <CardHeader className="text-center pb-4 px-0">
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100 dark:border-brand-900/30">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                Team Invitation
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 dark:text-gray-500 mt-2 px-4">
                You have been invited to join the organization <strong className="text-brand-600 dark:text-brand-400">{invitation.organizationName}</strong> as a <strong className="text-gray-600 dark:text-gray-300 font-semibold">{invitation.role}</strong>.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0 pt-2 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* FLOW 1: Already logged in as the correct user */}
              {user && isUserMatchingInvite && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 p-4 rounded-xl text-center space-y-2">
                    <p className="text-xs text-gray-500">Currently logged in as:</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-xs flex items-center justify-center">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-[10px] text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAcceptLoggedIn}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider"
                    isLoading={formLoading}
                  >
                    Accept Invitation & Join <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* FLOW 2: Logged in as a DIFFERENT user */}
              {user && !isUserMatchingInvite && (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-250 dark:border-yellow-900/40 rounded-xl space-y-2">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 font-bold flex items-center justify-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Account Mismatch
                    </p>
                    <p className="text-[11px] text-yellow-600 dark:text-yellow-500 leading-relaxed">
                      This invitation was issued to <strong className="underline">{invitation.email}</strong>, but you are signed in as <strong>{user.email}</strong>.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1 text-xs font-bold"
                      onClick={() => navigate('/dashboard')}
                    >
                      Back to Home
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-rose-250 text-rose-500 hover:bg-rose-50 text-xs font-bold"
                      onClick={async () => {
                        await logout();
                        toast.success('Logged out successfully');
                        window.location.reload();
                      }}
                    >
                      Log Out
                    </Button>
                  </div>
                </div>
              )}

              {/* FLOW 3: Guest - User exists in database, needs to log in */}
              {!user && invitation.userExists && (
                <form onSubmit={handleLoginAndJoin} className="space-y-4">
                  <div className="bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100/50 dark:border-brand-900/20 p-4 rounded-xl text-center space-y-1">
                    <LogIn className="h-5 w-5 text-brand-500 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-gray-800 dark:text-white">Existing Account Found</p>
                    <p className="text-[10px] text-gray-400">Please authenticate with your password to complete acceptance.</p>
                  </div>

                  <Input
                    label="Email address"
                    type="email"
                    value={invitation.email}
                    disabled
                    icon={<Mail className="h-4 w-4 text-gray-400" />}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4 text-gray-400" />}
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2"
                    isLoading={formLoading}
                  >
                    Verify & Join Team <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </form>
              )}

              {/* FLOW 4: Guest - User DOES NOT exist in database, needs to sign up */}
              {!user && !invitation.userExists && (
                <form onSubmit={handleSignupAndJoin} className="space-y-4">
                  <div className="bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100/50 dark:border-brand-900/20 p-4 rounded-xl text-center space-y-1">
                    <UserPlus className="h-5 w-5 text-brand-500 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-gray-800 dark:text-white">Welcome, newcomer!</p>
                    <p className="text-[10px] text-gray-400">Create an account below to accept and claim your team role.</p>
                  </div>

                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />

                  <Input
                    label="Email address"
                    type="email"
                    value={invitation.email}
                    disabled
                    icon={<Mail className="h-4 w-4 text-gray-400" />}
                  />

                  <Input
                    label="Create Password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4 text-gray-400" />}
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2"
                    isLoading={formLoading}
                  >
                    Register & Join Workspace <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
