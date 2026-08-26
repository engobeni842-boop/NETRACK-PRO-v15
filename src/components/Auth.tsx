<<<<<<< HEAD
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, UserPlus, LogIn } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);
      
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            NETRACK PRO
          </h1>
          <p className="text-gray-400">{isLogin ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-purple-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-purple-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Sign Up</>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-xs text-purple-300 text-center">
            Owner login: <span className="font-mono">engobeni842@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
=======
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, UserPlus, LogIn } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);
      
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            NETRACK PRO
          </h1>
          <p className="text-gray-400">{isLogin ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-purple-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-purple-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Sign Up</>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-xs text-purple-300 text-center">
            Owner login: <span className="font-mono">engobeni842@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
>>>>>>> 897a1bab5625ac3688a904f98344895b392ead82
}