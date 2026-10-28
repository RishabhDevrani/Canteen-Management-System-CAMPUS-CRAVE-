import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useGetMyOrdersQuery } from '../redux/orderApiSlice';
import { useCreateReviewMutation } from '../redux/menuApiSlice';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  XCircle,
  Utensils,
  Receipt,
  Star,
  Printer,
  X,
  Sparkles,
  Bell,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data: orders = [], isLoading, refetch } = useGetMyOrdersQuery();
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  // Real-time socket listener for instant order status updates
  useEffect(() => {
    const socket = io('http://localhost:5000');

    if (user?.id) {
      socket.emit('join_user_room', user.id);
    }

    socket.on('order_status_update', (updatedOrder) => {
      refetch();
      const statusText =
        updatedOrder.status === 'CONFIRMED'
          ? 'Confirmed by Kitchen! 👨‍🍳'
          : updatedOrder.status === 'PREPARING'
          ? 'Now Cooking in Kitchen! 🍳'
          : updatedOrder.status === 'READY'
          ? 'READY for Pickup at Counter! 🛎️'
          : updatedOrder.status === 'COMPLETED'
          ? 'Handed Over & Completed! Enjoy your meal 😋'
          : updatedOrder.status;

      toast.success(`Order #${updatedOrder.id}: ${statusText}`, {
        duration: 5000,
        icon: '🔔',
      });
    });

    socket.on('order_status_changed', () => {
      refetch();
    });

    return () => socket.disconnect();
  }, [user?.id, refetch]);

  // Polling for updates every 10 seconds as backup
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Modal states
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [reviewFoodItem, setReviewFoodItem] = useState(null); // { foodId, foodName, orderId }
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'READY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CONFIRMED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'PREPARING':
        return <ChefHat className="w-4 h-4" />;
      case 'READY':
        return <Utensils className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleOpenReview = (food) => {
    setReviewFoodItem(food);
    setRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewFoodItem) return;

    try {
      await createReview({
        foodId: reviewFoodItem.id,
        rating,
        comment: reviewComment.trim() || undefined,
      }).unwrap();

      toast.success(`Thank you for rating ${reviewFoodItem.name}!`);
      setReviewFoodItem(null);
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to submit review');
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PREPARING': return 2;
      case 'READY': return 3;
      case 'COMPLETED': return 4;
      default: return -1;
    }
  };

  const renderOrderProgress = (status) => {
    const currentIndex = getStepIndex(status);
    if (currentIndex === -1 || status === 'COMPLETED' || status === 'CANCELLED') return null;

    const steps = [
      { label: 'Placed', icon: Clock },
      { label: 'Confirmed', icon: CheckCircle2 },
      { label: 'Cooking', icon: ChefHat },
      { label: 'Ready', icon: Utensils },
    ];

    return (
      <div className="py-3 px-4 mb-5 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-2xl border border-orange-100">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-gray-200 z-0">
            <div
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${(currentIndex / 3) * 100}%` }}
            />
          </div>

          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={s.label} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 ring-4 ring-orange-200 scale-110'
                      : isCompleted
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`text-[10px] font-extrabold mt-1 uppercase tracking-wider ${
                    isCurrent
                      ? 'text-orange-600'
                      : isCompleted
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-500 font-medium">
              Track your active orders, view invoices, and leave food ratings.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500">When you place an order, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 transition hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-gray-100 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-gray-900 text-lg">
                        Order #{order.id.toString().padStart(4, '0')}
                      </span>
                      <span className="text-sm text-gray-400 font-medium">
                        {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-extrabold text-orange-600 text-lg">
                        ₹{order.finalAmount}
                      </p>
                      {order.discount > 0 && (
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                          Saved ₹{order.discount} with coupon
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition"
                      title="View & Print Bill Receipt"
                    >
                      <Receipt className="h-4 w-4" />
                      Invoice / Bill
                    </button>
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold shadow-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>
                </div>

                {/* Live Order Stepper for active orders */}
                {renderOrderProgress(order.status)}

                {/* Items List */}
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-orange-600 border border-orange-100">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.food.name}</p>
                          <p className="text-sm text-gray-500">₹{item.priceAtTime} each</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="font-bold text-gray-900">
                          ₹{item.priceAtTime * item.quantity}
                        </p>
                        <button
                          onClick={() => handleOpenReview(item.food)}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition"
                          title="Rate this dish"
                        >
                          <Star className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                          Rate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ready Alert */}
                {order.status === 'READY' && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-green-800">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold">Your order is ready for pickup!</p>
                          <p className="text-sm font-medium opacity-80">
                            Please show your Order #{order.id} at the counter.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice / Bill Printable Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-orange-500" />
                <span className="font-extrabold text-gray-900">Official Bill Receipt</span>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div id="printable-receipt" className="p-6 sm:p-8 space-y-6">
              {/* Receipt Header */}
              <div className="text-center pb-6 border-b border-dashed border-gray-200">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">CampusCrave Canteen</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">University Campus Food Court</p>
                <div className="inline-block mt-3 bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                  Receipt #{selectedInvoiceOrder.id.toString().padStart(5, '0')}
                </div>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-2 text-xs gap-3 text-gray-600">
                <div>
                  <span className="font-bold text-gray-400 block">DATE & TIME</span>
                  <span className="font-semibold text-gray-800">
                    {format(new Date(selectedInvoiceOrder.createdAt), 'dd MMM yyyy, h:mm a')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-400 block">STATUS</span>
                  <span className="font-bold text-orange-600 uppercase">
                    {selectedInvoiceOrder.status}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block">PAYMENT MODE</span>
                  <span className="font-semibold text-gray-800">
                    {selectedInvoiceOrder.payment?.method || 'CASH AT COUNTER'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-400 block">PAYMENT STATUS</span>
                  <span className="font-semibold text-gray-800">
                    {selectedInvoiceOrder.payment?.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-b border-gray-100 py-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 font-bold uppercase border-b border-gray-100">
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedInvoiceOrder.items.map((item) => (
                      <tr key={item.id} className="text-gray-800">
                        <td className="py-2 font-bold">{item.food.name}</td>
                        <td className="py-2 text-center font-semibold">{item.quantity}</td>
                        <td className="py-2 text-right font-medium text-gray-500">₹{item.priceAtTime}</td>
                        <td className="py-2 text-right font-bold">₹{item.priceAtTime * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>₹{selectedInvoiceOrder.totalAmount}</span>
                </div>
                {selectedInvoiceOrder.discount > 0 && (
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Discount</span>
                    <span>-₹{selectedInvoiceOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Taxes & Service</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-3 border-t border-dashed border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-xl text-orange-600">₹{selectedInvoiceOrder.finalAmount}</span>
                </div>
              </div>

              <div className="text-center text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                Thank you for ordering at CampusCrave! Please show this receipt at pickup.
              </div>
            </div>

            {/* Print and Close Actions */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 hover:bg-orange-500 font-bold text-xs text-white transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="h-4 w-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate & Review Modal */}
      {reviewFoodItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <span className="font-extrabold text-gray-900">Rate & Review Food</span>
              </div>
              <button
                onClick={() => setReviewFoodItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-5 text-center">
              <div>
                <h3 className="font-extrabold text-xl text-gray-900">{reviewFoodItem.name}</h3>
                <p className="text-xs text-gray-500 mt-1">How was your meal? Rate your experience</p>
              </div>

              {/* 5 Stars Rating Picker */}
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-gray-500">
                {rating === 5
                  ? '⭐⭐⭐⭐⭐ Delicious!'
                  : rating === 4
                  ? '⭐⭐⭐⭐ Very Good'
                  : rating === 3
                  ? '⭐⭐⭐ Average'
                  : rating === 2
                  ? '⭐⭐ Below Expectations'
                  : '⭐ Poor'}
              </span>

              {/* Review Comment Area */}
              <div className="text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Your Comment (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us what you liked about the taste, portion, or preparation..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewFoodItem(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white transition shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
