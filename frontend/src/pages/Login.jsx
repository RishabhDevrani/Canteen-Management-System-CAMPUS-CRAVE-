import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import {
  useLoginMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation,
  useResendOtpMutation,
} from '../redux/authApiSlice';
import { setCredentials } from '../redux/authSlice';

const dashboardByRole = {
  ADMIN: '/dashboard/admin',
  STAFF: '/dashboard/staff',
  KITCHEN: '/dashboard/kitchen',
  CUSTOMER: '/dashboard/customer',
};

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showOtp, setShowOtp] = useState(location.state?.isRegistering || false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isRegisteringMode, setIsRegisteringMode] = useState(location.state?.isRegistering || false);
  const [cooldown, setCooldown] = useState(0);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyLoginOtp, { isLoading: isVerifyLoading }] = useVerifyLoginOtpMutation();
  const [verifyRegisterOtp, { isLoading: isVerifyRegisterLoading }] = useVerifyRegisterOtpMutation();
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendOtp = async () => {
    if (cooldown > 0 || isResendingOtp) return;
    try {
      await resendOtp({
        email,
        type: isRegisteringMode ? 'REGISTER' : 'LOGIN',
      }).unwrap();
      toast.success('A new OTP has been sent to your email!');
      setCooldown(60);
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to resend OTP');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      await login({ email, password }).unwrap();
      toast.success('OTP sent to your email!');
      setIsRegisteringMode(false);
      setShowOtp(true);
      setCooldown(60);
    } catch (err) {
      toast.error(err?.data?.error || 'Login failed');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      if (isRegisteringMode) {
        await verifyRegisterOtp({ email, otp: otpValue }).unwrap();
        toast.success('Email verified! You can now sign in.');
        setShowOtp(false);
        setPassword('');
        setOtp(['', '', '', '', '', '']);
      } else {
        const res = await verifyLoginOtp({ email, otp: otpValue }).unwrap();
        dispatch(setCredentials({ user: res.user, token: res.token }));
        toast.success('Login Successful!');
        navigate(dashboardByRole[res.user?.role] || '/dashboard/customer', { replace: true });
      }
    } catch (err) {
      toast.error(err?.data?.error || 'OTP Verification failed');
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] font-sans">
      <div className="max-w-5xl w-full flex bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Left Side - Image/Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-white mb-8">
              <ChefHat className="h-10 w-10 text-orange-500" />
              <h1 className="text-3xl font-extrabold tracking-tight">CampusCrave</h1>
            </div>
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-6 mt-12">
              Skip the line.<br />
              <span className="text-orange-500">Savor the flavor.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-sm">
              Order your favorite campus meals ahead of time and pick them up fresh.
            </p>
          </div>
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-14 flex flex-col justify-center">
          {!showOtp ? (
            <div className="w-full max-w-md mx-auto">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500 font-medium">Please sign in to your account</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                      placeholder="you@university.edu"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">Password</label>
                    <Link to="/forgot-password" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-orange-500 focus:outline-none transition-colors duration-300 mt-4"
                >
                  Sign In
                </button>
              </form>

              <p className="mt-10 text-center text-sm font-medium text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-orange-500 hover:text-orange-600 transition">
                  Create one now
                </Link>
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 font-medium mb-10">
                We've sent a 6-digit secure OTP to <br />
                <span className="font-bold text-gray-900">{email}</span>
              </p>

              <form onSubmit={handleOtpSubmit}>
                <div className="flex justify-center gap-3 mb-10">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-extrabold border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none transition bg-gray-50 focus:bg-white text-gray-900"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-300"
                >
                  Verify OTP & Login
                </button>
              </form>

              <p className="mt-8 text-sm font-medium text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || isResendingOtp}
                  className="font-bold text-gray-900 hover:text-orange-500 disabled:text-gray-400 transition"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
