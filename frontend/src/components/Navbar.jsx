import { Link, useLocation } from 'react-router-dom';
import { Utensils, ShoppingBag, User, LogOut, Flame, Shield, ChefHat } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);

  const handleLogout = () => {
    dispatch(logout());
  };

  const dashboardPath =
    user?.role === 'ADMIN'
      ? '/dashboard/admin'
      : user?.role === 'KITCHEN'
      ? '/dashboard/kitchen'
      : user?.role === 'STAFF'
      ? '/dashboard/staff'
      : '/dashboard/customer';

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">ADMIN</span>;
      case 'KITCHEN':
        return <span className="bg-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">CHEF</span>;
      case 'STAFF':
        return <span className="bg-blue-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">STAFF</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="backdrop-blur-md bg-white/90 border-b border-gray-100/80 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
              <Utensils className="h-6 w-6 transform group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">
                  Campus<span className="text-orange-500">Crave</span>
                </span>
                <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Smart Food Court
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100/70 p-1.5 rounded-full border border-gray-200/50">
            <Link
              to="/"
              className={`px-5 py-2 rounded-full text-xs font-extrabold transition ${
                location.pathname === '/'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Menu & Dishes
            </Link>
            {isAuthenticated && (
              <Link
                to={dashboardPath}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition ${
                  location.pathname.startsWith('/dashboard')
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {user?.role === 'CUSTOMER' ? 'My Orders' : 'Dashboard'}
              </Link>
            )}
          </div>

          {/* Right Actions: Cart & Profile */}
          <div className="flex items-center gap-4">
            
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2.5 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 px-4 py-2.5 rounded-full border border-gray-200/70 hover:border-orange-200 transition-all duration-300 group shadow-sm"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5 text-gray-700 group-hover:text-orange-600 transition-colors" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                    {totalQuantity}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">Bag</span>
            </Link>

            {/* User State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2.5 bg-white hover:bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-200 shadow-sm transition hover:border-orange-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-gray-900 group-hover:text-orange-600 transition">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                      {getRoleBadge(user?.role)}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition border border-transparent hover:border-red-100"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-extrabold text-xs px-4 py-2.5 rounded-full hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 hover:bg-orange-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-gray-900/10 hover:shadow-orange-500/25"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
