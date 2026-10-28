import { useEffect, useState } from 'react';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../redux/orderApiSlice';
import { io } from 'socket.io-client';
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  ShoppingBag,
  ChefHat,
  Printer,
  AlertCircle,
  Check,
  Receipt,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function StaffDashboard() {
  const { data: orders = [], isLoading, refetch } = useGetAllOrdersQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const [activeTab, setActiveTab] = useState('READY'); // 'READY', 'KITCHEN', 'COMPLETED', 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlipOrder, setSelectedSlipOrder] = useState(null);

  // Real-time socket listener
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('new_order', (order) => {
      refetch();
    });

    socket.on('order_status_changed', (order) => {
      refetch();
      if (order?.status === 'READY') {
        toast.success(`🔔 Order #${order.id} is READY for Handover!`, {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
          },
        });
      }
    });

    return () => socket.disconnect();
  }, [refetch]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Order #${id} handed over successfully!`);
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to update status');
    }
  };

  const handlePrintSlip = (order) => {
    setSelectedSlipOrder(order);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  const readyOrders = orders.filter((o) => o.status === 'READY');
  const kitchenOrders = orders.filter((o) => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  const filteredOrders = orders.filter((order) => {
    let matchesTab = true;
    if (activeTab === 'READY') matchesTab = order.status === 'READY';
    else if (activeTab === 'KITCHEN') matchesTab = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status);
    else if (activeTab === 'COMPLETED') matchesTab = order.status === 'COMPLETED';

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesTab;

    const matchesSearch =
      order.id.toString().includes(query) ||
      (order.user?.name && order.user.name.toLowerCase().includes(query)) ||
      (order.user?.email && order.user.email.toLowerCase().includes(query)) ||
      order.items?.some((item) => item.food?.name.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-gray-500 font-medium text-sm">Loading counter orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-orange-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-950 via-gray-900 to-gray-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Counter Staff Desk</h1>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Dispatch
                  </span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium mt-1">
                  Verify customer tokens, collect cash on counter, and hand over ready food.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Queue
              </button>
            </div>
          </div>
        </div>

        {/* Real-time KPI Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveTab('READY')}
            className={`p-5 rounded-3xl border cursor-pointer transition shadow-sm flex items-center gap-4 ${
              activeTab === 'READY'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ready For Pickup</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl font-black text-emerald-600">{readyOrders.length}</span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('KITCHEN')}
            className={`p-5 rounded-3xl border cursor-pointer transition shadow-sm flex items-center gap-4 ${
              activeTab === 'KITCHEN'
                ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cooking in Kitchen</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl font-black text-orange-600">{kitchenOrders.length}</span>
                <span className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-0.5 rounded-full">
                  In Progress
                </span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('COMPLETED')}
            className={`p-5 rounded-3xl border cursor-pointer transition shadow-sm flex items-center gap-4 ${
              activeTab === 'COMPLETED'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Handed Over (Total)</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl font-black text-gray-900">{completedOrders.length}</span>
                <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                  Delivered
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Tabs Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Tab buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('READY')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'READY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>Ready for Handover</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'READY' ? 'bg-white text-emerald-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {readyOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('KITCHEN')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'KITCHEN'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>Cooking in Kitchen</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'KITCHEN' ? 'bg-white text-orange-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {kitchenOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'COMPLETED'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>Handed Over History</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'COMPLETED' ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-700'
              }`}>
                {completedOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'ALL'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search token #, customer, dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Order Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const isCashPending =
              order.payment?.method === 'CASH' && order.payment?.status === 'PENDING';
            const isPaid =
              order.payment?.status === 'SUCCESS' || order.payment?.method === 'UPI' || order.payment?.method === 'CARD';
            const payableAmount = order.finalAmount ?? order.totalAmount;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border flex flex-col shadow-sm hover:shadow-lg transition overflow-hidden ${
                  order.status === 'READY'
                    ? 'border-emerald-200 ring-2 ring-emerald-500/10'
                    : 'border-gray-200'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gradient-to-b from-gray-50 to-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-black text-2xl tracking-tight">
                        #{order.id}
                      </span>
                      {order.table?.tableNumber && (
                        <span className="bg-gray-200 text-gray-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          Table {order.table.tableNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {order.user?.name || 'Walk-in Customer'}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {format(new Date(order.createdAt), 'hh:mm a • dd MMM')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border ${
                        order.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                          : order.status === 'PREPARING'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : order.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : order.status === 'COMPLETED'
                          ? 'bg-gray-100 text-gray-700 border-gray-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {order.status === 'READY' ? 'READY FOR PICKUP' : order.status}
                    </span>

                    <button
                      onClick={() => handlePrintSlip(order)}
                      className="text-gray-400 hover:text-gray-700 text-xs flex items-center gap-1 font-semibold transition mt-1"
                      title="Print Token Slip"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Slip
                    </button>
                  </div>
                </div>

                {/* Payment Badge Banner */}
                <div
                  className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between border-b ${
                    isCashPending
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isCashPending ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span>COLLECT CASH AT COUNTER:</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>PAYMENT CONFIRMED ({order.payment?.method || 'ONLINE'}):</span>
                      </>
                    )}
                  </div>
                  <span className="font-black text-sm">₹{payableAmount}</span>
                </div>

                {/* Items List */}
                <div className="p-5 flex-1 space-y-3">
                  <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                    Food Items ({order.items?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 font-black text-xs flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">
                              {item.food?.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              ₹{item.priceAtTime} each
                            </p>
                          </div>
                        </div>
                        <span className="font-extrabold text-xs text-gray-700">
                          ₹{item.priceAtTime * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-600 font-bold pt-2 border-t border-gray-100">
                      <span>Discount Applied:</span>
                      <span>-₹{order.discount}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 mt-auto">
                  {order.status === 'READY' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                      disabled={isUpdating}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Hand Over & Settle Order
                    </button>
                  )}

                  {order.status === 'PENDING' && (
                    <div className="w-full bg-amber-50 text-amber-800 font-bold py-3 px-4 rounded-2xl border border-amber-200 text-center text-xs flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      New Order Placed — Waiting for Kitchen to Accept
                    </div>
                  )}

                  {order.status === 'PREPARING' && (
                    <div className="w-full bg-orange-50 text-orange-700 font-bold py-3 px-4 rounded-2xl border border-orange-200 text-center text-xs flex items-center justify-center gap-2">
                      <ChefHat className="h-4 w-4 animate-bounce" />
                      Cooking in Kitchen — Will be ready soon
                    </div>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <div className="w-full bg-blue-50 text-blue-700 font-bold py-3 px-4 rounded-2xl border border-blue-200 text-center text-xs flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      Queued in Kitchen Display
                    </div>
                  )}

                  {order.status === 'COMPLETED' && (
                    <div className="w-full bg-gray-100 text-gray-600 font-bold py-3 px-4 rounded-2xl text-center text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Handed Over to Customer
                    </div>
                  )}

                  {order.status === 'CANCELLED' && (
                    <div className="w-full bg-red-50 text-red-600 font-bold py-3 px-4 rounded-2xl text-center text-xs">
                      Cancelled Order
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-100 p-8">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-bold text-gray-800">No orders found in this view</p>
              <p className="text-gray-400 text-sm mt-1">
                {activeTab === 'READY'
                  ? 'All ready orders have been handed over!'
                  : 'Try selecting a different filter or clearing search.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Printable Token / Slip Modal */}
      {selectedSlipOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setSelectedSlipOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Printable Content */}
            <div id="printable-token-slip" className="text-center font-mono">
              <div className="border-b-2 border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-lg font-black text-gray-900 tracking-wider">CAMPUS CRAVE</h2>
                <p className="text-[11px] text-gray-500">Counter Pickup Token</p>
                <div className="my-2 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-3xl font-black text-gray-900">
                    TOKEN #{selectedSlipOrder.id}
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-700">
                  Customer: {selectedSlipOrder.user?.name || 'Customer'}
                </p>
                <p className="text-[10px] text-gray-400">
                  {format(new Date(selectedSlipOrder.createdAt), 'dd/MM/yyyy hh:mm a')}
                </p>
              </div>

              {/* Items */}
              <div className="text-left space-y-2 py-2 border-b-2 border-dashed border-gray-300 text-xs">
                {selectedSlipOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.food?.name}
                    </span>
                    <span className="font-bold">₹{item.priceAtTime * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="text-left text-xs py-2 space-y-1 border-b-2 border-dashed border-gray-300">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>₹{selectedSlipOrder.totalAmount}</span>
                </div>
                {selectedSlipOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-₹{selectedSlipOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-gray-900 pt-1">
                  <span>Total Amount:</span>
                  <span>₹{selectedSlipOrder.finalAmount ?? selectedSlipOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-600 pt-1">
                  <span>Payment:</span>
                  <span>{selectedSlipOrder.payment?.method || 'CASH'} ({selectedSlipOrder.payment?.status || 'PENDING'})</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 mt-4 tracking-wider">
                *** THANK YOU! ENJOY YOUR MEAL ***
              </p>
            </div>

            {/* Print Action Buttons */}
            <div className="mt-6 flex gap-3 print:hidden">
              <button
                onClick={triggerBrowserPrint}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-600/20"
              >
                <Printer className="h-4 w-4" /> Print Slip
              </button>
              <button
                onClick={() => setSelectedSlipOrder(null)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
