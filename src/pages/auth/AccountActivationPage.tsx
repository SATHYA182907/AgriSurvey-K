import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Compass,
  KeyRound,
  User,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { registrationService } from '@/services/registration.service';
import { Profile, RegistrationApplication, AccountActivationToken } from '@/types';

export const AccountActivationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';
  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [isValidating, setIsValidating] = useState(Boolean(tokenParam));
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    tokenRecord?: AccountActivationToken;
    farmer?: Profile;
    application?: RegistrationApplication;
    reason?: string;
  } | null>(null);

  // Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<{
    username: string;
  } | null>(null);

  // Check token on mount if provided in query string
  useEffect(() => {
    if (tokenParam) {
      validateToken(tokenParam);
    }
  }, [tokenParam]);

  const validateToken = async (tok: string) => {
    setIsValidating(true);
    setErrorMessage(null);
    try {
      const res = await registrationService.validateActivationToken(tok);
      setValidationResult(res);
      if (!res.valid) {
        setErrorMessage(res.reason || 'Invalid or expired activation link.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error validating activation link.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMessage('Please enter your official activation token or code.');
      return;
    }
    validateToken(tokenInput.trim());
  };

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const passwordsMatch = password && password === confirmPassword;
  const isFormValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage('Please satisfy all password security criteria before continuing.');
      return;
    }

    const currentToken = validationResult?.tokenRecord?.token || tokenInput.trim();
    setIsActivating(true);
    setErrorMessage(null);

    try {
      const res = await registrationService.activateFarmerAccount({
        token: currentToken,
        newPassword: password,
      });

      setIsActivating(false);
      setActivationSuccess({ username: res.username });
    } catch (err: any) {
      setIsActivating(false);
      setErrorMessage(err.message || 'Failed to activate account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 group px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-emerald-400/50 shadow-xl transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold text-white tracking-wide">
            AGRI<span className="text-emerald-400">SURVEY</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Farmer Account Activation
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          Establish your secure password to activate your verified portal access
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Card className="p-6 sm:p-8 bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
          {/* STATE 1: Activation Completed Successfully */}
          {activationSuccess ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-slate-900">Account Activated Successfully!</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your secure password has been established. You can now log in using your official assigned username:
                </p>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl font-mono font-bold text-emerald-900 text-base">
                  {activationSuccess.username}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  size="lg"
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/auth/login')}
                >
                  Proceed to Farmer Login
                </Button>
              </div>
            </div>
          ) : !validationResult || !validationResult.valid ? (
            /* STATE 2: Need Token or Invalid Token */
            <div className="space-y-5">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="text-xs text-slate-600 leading-relaxed">
                If you received an SMS approval from the Tahsildar Office containing an activation link,
                enter the activation code below to verify your account:
              </div>

              <form onSubmit={handleManualTokenSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Activation Code / Token
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="e.g. act_1771746982_x9y2z1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  size="md"
                  className="w-full"
                  disabled={isValidating}
                  icon={<KeyRound className="w-3.5 h-3.5" />}
                >
                  {isValidating ? 'Validating Token...' : 'Verify Activation Token'}
                </Button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Awaiting Tahsildar approval? </span>
                <Link to="/farmer/application-status" className="font-bold text-emerald-700 hover:underline">
                  Track Application Status
                </Link>
              </div>
            </div>
          ) : (
            /* STATE 3: Token Validated -> Set Secure Password Form */
            <form onSubmit={handleActivate} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Verified Applicant Info Badge */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-800 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Approved Application Verified</span>
                  </span>
                  <span className="font-mono text-[11px]">{validationResult.application?.application_reference}</span>
                </div>
                <div className="text-slate-700">
                  Farmer: <span className="font-bold">{validationResult.farmer?.full_name}</span>
                </div>
                <div className="text-slate-700">
                  Assigned Username: <span className="font-mono font-bold text-emerald-900">{validationResult.tokenRecord?.username}</span>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 8 strong characters"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Password Strength Checklist */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                <div className="font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1">
                  Password Security Requirements
                </div>
                {[
                  { label: 'Minimum 8 characters', met: hasMinLength },
                  { label: 'At least one uppercase letter (A-Z)', met: hasUpper },
                  { label: 'At least one lowercase letter (a-z)', met: hasLower },
                  { label: 'At least one number (0-9)', met: hasNumber },
                  { label: 'At least one special character (!@#$%^&*)', met: hasSpecial },
                  { label: 'Passwords match', met: Boolean(password && passwordsMatch) },
                ].map((crit, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    {crit.met ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={crit.met ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                      {crit.label}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!isFormValid || isActivating}
                icon={<Lock className="w-4 h-4" />}
              >
                {isActivating ? 'Activating Account...' : 'Set Password & Activate Account'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
