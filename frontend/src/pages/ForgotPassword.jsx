import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
} from '../redux/authApiSlice';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    try {
      await forgotPassword({ email }).unwrap();
      toast.success('Password reset OTP sent to your email!');
      setStep(2);
      setCooldown(60); // 60s cooldown
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to send reset code');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    try {
      await resendOtp({ email, type: 'RESET' }).unwrap();
      toast.success('A fresh OTP has been sent to your email!');
      setCooldown(60);
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to resend code');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await resetPassword({
        email,
        otp: otpValue,
        newPassword,
      }).unwrap();

      toast.success('Password changed successfully! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to reset password');
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] font-sans">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        
        {/* Header Icon */}
        <div className="text-center mb-8">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
            <KeyRound className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {step === 1 ? 'Reset Password' : 'Enter Verification Code'}
          </h2>
          <p className="text-gray-500 mt-2 font-medium text-sm">
            {step === 1
              ? "Enter your account email and we'll send a 6-digit OTP code."
              : `Code sent to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                  placeholder="you@university.edu"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-orange-500 focus:outline-none transition-colors duration-300 disabled:opacity-60"
            >
              {isSendingOtp ? 'Sending OTP...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 text-center mb-3">
                6-Digit Verification Code
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`reset-otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-extrabold border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition bg-gray-50 focus:bg-white text-gray-900"
                  />
                ))}
              </div>
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isResending}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 disabled:text-gray-400 transition"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white text-sm"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white text-sm"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none transition-colors duration-300 mt-2 disabled:opacity-60"
            >
              {isResetting ? 'Saving Password...' : 'Save & Login'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
