import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { LayoutDashboard } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Branding Section */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-600 to-brand-900 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-lg">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskHub</span>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Manage your tasks with<br />unprecedented clarity.
          </h1>
          <p className="text-brand-100 text-lg max-w-md">
            The ultimate cloud-based task manager for modern teams. Organize, collaborate, and deliver projects on time.
          </p>
        </div>
        
        <div className="text-sm text-brand-200">
          © 2026 TaskHub Inc. All rights reserved.
        </div>
      </div>

      {/* Right Auth Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TaskHub</span>
          </div>

          <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-white dark:bg-transparent sm:dark:bg-gray-900">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Enter your email and password to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                
                <div className="space-y-1">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                  />
                  <div className="flex justify-end">
                    <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-2" 
                  isLoading={loading}
                >
                  Sign in
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
