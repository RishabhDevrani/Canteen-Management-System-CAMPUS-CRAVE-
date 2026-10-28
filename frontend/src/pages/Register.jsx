import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '../redux/authApiSlice';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }).unwrap();
      
      toast.success('Registration initiated. Check email for OTP!');
      // Navigate to login with the email pre-filled to verify OTP
      navigate('/login', { state: { email: formData.email, isRegistering: true } });
    } catch (err) {
      toast.error(err?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2 font-medium">Join CampusCrave today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="you@university.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:ring-0 focus:border-orange-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-orange-500 focus:outline-none transition-colors duration-300 mt-4"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-orange-500 hover:text-orange-600 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
