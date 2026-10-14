import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { ROLE_DEFAULT_ROUTES } from '@/lib/permissions';
import { UserRole } from '@/types';
import { mockDb } from '@/services/mock-db';

export const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { user } = await authService.signIn(email, password);
      setIsLoading(false);
      navigate(ROLE_DEFAULT_ROUTES[user.role]);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Invalid credentials. Please verify your login details.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (!fullName || fullName.length < 3) {
      setErrorMsg('Full name must be at least 3 characters long');
      setIsLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      setIsLoading(false);
      return;
    }

    try {
      const user = await authService.signUpFarmer(fullName, email, phoneNumber, password);
      setIsLoading(false);
      setSuccessMsg('Farmer account created successfully! Proceeding to land registration.');
      setTimeout(() => {
        navigate('/farmer/register');
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error creating account. Please try again.');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const user = authService.switchRole(role);
    navigate(ROLE_DEFAULT_ROUTES[user.role]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-agri-gradient flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Agri<span className="text-emerald-700">Survey</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500 mt-1">
          Agricultural Land Administration & Verification Gateway
        </p>
      </div>

      {/* Split Layout Container */}
      <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Authentication Form (7 Cols) */}
        <div className="p-6 sm:p-10 md:col-span-7 flex flex-col justify-between">
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'signin'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'signup'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Create Farmer Account
              </button>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., farmer.ramesh@agrisurvey.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <a href="#forgot" className="text-xs text-emerald-700 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                  Sign In to AgriSurvey
                </Button>
              </form>
            ) : (
              /* Farmer Account Creation Form */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name (as on Land Records)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Ramesh Balasaheb Patil"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number (10 digits)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g., 9822012345"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., ramesh.patil@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                  Create Farmer Profile
                </Button>
              </form>
            )}

            {/* Staff Accounts Provisioning Notice (Section 6 Requirement) */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">Official Staff Notice:</span> Tahsildar, Field Worker,
              and Admin roles are provisioned exclusively through authorized administrative credentials.
            </div>
          </div>

          {/* Quick Demo Switcher Section (Section 27 & Dev Mode) */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Persona Login (Evaluation Mode)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickDemoLogin('farmer')}
                className="p-2 bg-white rounded-lg border border-slate-200 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="font-semibold text-slate-800">Ramesh Patil</div>
                <div className="text-[10px] text-emerald-700">Farmer Persona</div>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('tahsildar')}
                className="p-2 bg-white rounded-lg border border-slate-200 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="font-semibold text-slate-800">Anand Kulkarni</div>
                <div className="text-[10px] text-teal-700">Tahsildar (Haveli)</div>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('field_worker')}
                className="p-2 bg-white rounded-lg border border-slate-200 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="font-semibold text-slate-800">Prakash Jadhav</div>
                <div className="text-[10px] text-cyan-700">Field Worker / Drone</div>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2 bg-white rounded-lg border border-slate-200 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="font-semibold text-slate-800">Dr. Sundaram</div>
                <div className="text-[10px] text-slate-700">Admin Superuser</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Visual & Product Description (5 Cols) */}
        <div className="hidden md:flex md:col-span-5 bg-agri-gradient text-white p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-semibold text-emerald-100 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Digital Verification</span>
            </div>

            <h3 className="text-xl font-bold leading-snug mb-3">
              Digitizing Land Records Across Pune & Maharashtra
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed mb-6">
              Empowering farmers with transparent digital land submissions while equipping revenue authorities
              with centimeter-accurate aerial evidence.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>Encrypted document repository for 7/12 land records</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>Centimeter-precise drone photogrammetry verification</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>Tamper-evident audit logging for every decision</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 text-[10px] text-emerald-200">
            Official Land Records Administration • AgriSurvey
          </div>
        </div>
      </div>
    </div>
  );
};
