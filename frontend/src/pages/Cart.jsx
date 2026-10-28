import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, UtensilsCrossed, Tag, X, Check } from 'lucide-react';
import { addToCart, decreaseQuantity, removeFromCart, clearCart } from '../redux/cartSlice';
import { useCreateOrderMutation, useApplyCouponMutation } from '../redux/orderApiSlice';
import toast from 'react-hot-toast';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const res = await applyCoupon({ code, subtotal: totalAmount }).unwrap();
      setAppliedCoupon(res);
      setCouponCode('');
      toast.success(res.message || 'Coupon applied successfully!');
    } catch (err) {
      toast.error(err?.data?.error || 'Invalid or expired coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const payableTotal = Math.max(0, totalAmount - discountAmount);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({ foodId: item.id, quantity: item.quantity })),
        paymentMethod: 'CASH', // Defaulting to Cash on Delivery / Counter
        couponCode: appliedCoupon?.code || undefined,
      };
      
      await createOrder(orderData).unwrap();
      dispatch(clearCart());
      toast.success('Order placed successfully! Redirecting to dashboard...');
      navigate('/dashboard/customer');
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-orange-100 p-6 rounded-full mb-6">
          <UtensilsCrossed className="h-16 w-16 text-orange-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-center">
          Looks like you haven't added any delicious meals to your cart yet.
        </p>
        <Link 
          to="/"
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition shadow-lg flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
                  {items.length} items
                </span>
              </div>
              
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 py-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-24 h-24 rounded-2xl object-cover shadow-sm"
                    />
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-orange-500 font-bold">₹{item.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                      <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-full border border-gray-200">
                        <button 
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-orange-500 hover:bg-orange-50 shadow-sm transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-4 text-center font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => dispatch(addToCart(item))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-orange-500 hover:bg-orange-50 shadow-sm transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="w-20 text-right">
                        <p className="font-extrabold text-gray-900">₹{item.totalPrice}</p>
                      </div>
                      
                      <button 
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-gray-400 hover:text-red-500 transition p-2 bg-red-50 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">Order Summary</h2>

              {/* Coupon Code Section */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Tag className="h-4 w-4 text-orange-500" />
                  Have a Coupon Code?
                </div>

                {!appliedCoupon ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. CAMPUS20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm font-bold uppercase placeholder:normal-case placeholder:font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="bg-gray-900 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className="text-[11px] font-semibold text-gray-400 self-center">Try:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('CAMPUS20')}
                        className="text-[11px] bg-white border border-orange-200 text-orange-600 px-2 py-0.5 rounded-lg font-bold hover:bg-orange-50 transition"
                      >
                        CAMPUS20 (20% off)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('FLAT50')}
                        className="text-[11px] bg-white border border-orange-200 text-orange-600 px-2 py-0.5 rounded-lg font-bold hover:bg-orange-50 transition"
                      >
                        FLAT50 (₹50 off)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-2.5 text-xs">
                    <div className="flex items-center gap-2 text-green-800 font-bold">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{appliedCoupon.code} applied (-₹{appliedCoupon.discount})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                      title="Remove coupon"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-gray-600 font-medium text-sm">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold text-sm">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 font-medium text-sm">
                  <span>Taxes & Canteen Charges</span>
                  <span className="text-gray-400 font-normal">₹0 (Included)</span>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total Payable</span>
                  <span className="text-3xl font-black text-gray-900">₹{payableTotal}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing Order...' : `Place Order (₹${payableTotal})`}
              </button>
              
              <p className="text-center text-xs text-gray-400">
                Pay at counter when you pick up your meal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
