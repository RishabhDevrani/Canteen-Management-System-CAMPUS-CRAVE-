import { useEffect, useState } from 'react';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../redux/orderApiSlice';
import { io } from 'socket.io-client';
import {
  ChefHat,
  CheckCircle2,
  Clock,
  Play,
  Search,
  RefreshCw,
  Flame,
  Check,
  UtensilsCrossed,
  Sparkles,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function KitchenDashboard() {
  const { data: orders = [], isLoading, error, refetch } = useGetAllOrdersQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE', 'PENDING', 'COOKING', 'READY', 'COMPLETED', 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItems, setCheckedItems] = useState({}); // { `${orderId}-${itemId}`: boolean }

  // Real-time socket listener
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('new_order', (order) => {
      toast.success(`🔔 New Order #${order.id} received in Kitchen!`, {
        duration: 5000,
        style: {
          background: '#f97316',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
      refetch();
    });

    socket.on('order_status_changed', () => {
      refetch();
    });

    return () => socket.disconnect();
  }, [refetch]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      const statusMsg =
        status === 'CONFIRMED'
          ? `Order #${id} Accepted!`
          : status === 'PREPARING'
          ? `Order #${id} is now Cooking!`
          : status === 'READY'
          ? `Order #${id} marked Ready for Pickup!`
          : `Order #${id} updated to ${status}`;

      toast.success(statusMsg);
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to update order status');
    }
  };

  const toggleItemCheck = (orderId, itemId) => {
    const key = `${orderId}-${itemId}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const cookingOrders = orders.filter((o) => ['CONFIRMED', 'PREPARING'].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const activeOrders = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
  );

  const filteredOrders = orders.filter((order) => {
    let matchesTab = true;
    if (activeTab === 'ACTIVE') {
      matchesTab = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status);
    } else if (activeTab === 'PENDING') {
      matchesTab = order.status === 'PENDING';
    } else if (activeTab === 'COOKING') {
      matchesTab = ['CONFIRMED', 'PREPARING'].includes(order.status);
    } else if (activeTab === 'READY') {
      matchesTab = order.status === 'READY';
    } else if (activeTab === 'COMPLETED') {
      matchesTab = order.status === 'COMPLETED';
    } else if (activeTab === 'ALL') {
      matchesTab = true;
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesTab;

    const matchesSearch =
      order.id.toString().includes(query) ||
      (order.user?.name && order.user.name.toLowerCase().includes(query)) ||
      order.items?.some((item) => item.food?.name.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
          <p className="text-gray-500 font-medium text-sm">Loading kitchen queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f8f9fa] p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-200 text-center max-w-md shadow-xl">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kitchen Access Error</h2>
          <p className="text-gray-500 text-sm mb-6">
            {error?.data?.error || 'Unable to connect to kitchen live feed.'}
          </p>
          <button
            onClick={() => refetch()}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-orange-500/20"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-orange-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-orange-950 via-gray-900 to-gray-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Kitchen Display System</h1>
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
                    Live Station
                  </span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium mt-1">
                  Live ticket preparation, stove queue, and counter dispatch monitor.
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
            onClick={() => setActiveTab('PENDING')}
            className={`p-5 rounded-3xl border cursor-pointer transition shadow-sm flex items-center gap-4 ${
              activeTab === 'PENDING'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Incoming Orders</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl font-black text-amber-600">{pendingOrders.length}</span>
                <span className="text-xs text-amber-600 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                  Needs Acceptance
                </span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('COOKING')}
            className={`p-5 rounded-3xl border cursor-pointer transition shadow-sm flex items-center gap-4 ${
              activeTab === 'COOKING'
                ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cooking on Stove</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl font-black text-orange-600">{cookingOrders.length}</span>
                <span className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-0.5 rounded-full">
                  In Progress
                </span>
              </div>
            </div>
          </div>

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
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ready at Counter</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-3xl font-black text-emerald-600">{readyOrders.length}</span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Waiting for Pickup
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'ACTIVE'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>Active Kitchen Queue</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'ACTIVE' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {pendingOrders.length + cookingOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>New Orders</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'PENDING' ? 'bg-white text-amber-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {pendingOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('COOKING')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'COOKING'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>Cooking In Progress</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'COOKING' ? 'bg-white text-orange-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {cookingOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('READY')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === 'READY'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>Ready for Counter</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'READY' ? 'bg-white text-emerald-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {readyOrders.length}
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
              <span>Completed History</span>
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
              All Tickets ({orders.length})
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search token #, dish name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'PENDING';
            const isConfirmed = order.status === 'CONFIRMED';
            const isPreparing = order.status === 'PREPARING';
            const isReady = order.status === 'READY';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border flex flex-col shadow-sm hover:shadow-lg transition overflow-hidden ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-500/20'
                    : isPreparing
                    ? 'border-orange-300 ring-2 ring-orange-500/20'
                    : isReady
                    ? 'border-emerald-300'
                    : 'border-blue-200'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gradient-to-b from-gray-50 to-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600 font-black text-3xl tracking-tight">
                        #{order.id}
                      </span>
                      {order.table?.tableNumber ? (
                        <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          Table {order.table.tableNumber}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          Takeaway / Counter
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {order.user?.name || 'Customer'}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {format(new Date(order.createdAt), 'hh:mm a')}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border ${
                      isPending
                        ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                        : isPreparing
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : isConfirmed
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : isReady
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    {isPending
                      ? 'NEW ORDER'
                      : isPreparing
                      ? 'COOKING'
                      : isConfirmed
                      ? 'ACCEPTED'
                      : isReady
                      ? 'READY'
                      : order.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                      Dishes to Prepare ({order.items?.length || 0})
                    </p>
                    <span className="text-[10px] font-bold text-gray-400">
                      Tap to check off
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item) => {
                      const itemKey = `${order.id}-${item.id}`;
                      const isChecked = !!checkedItems[itemKey];

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItemCheck(order.id, item.id)}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition select-none ${
                            isChecked
                              ? 'bg-emerald-50/70 border-emerald-200 opacity-60'
                              : 'bg-gray-50 hover:bg-orange-50/50 border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 font-black text-sm flex items-center justify-center">
                              {item.quantity}x
                            </span>
                            <div>
                              <p
                                className={`text-sm font-bold leading-tight ${
                                  isChecked
                                    ? 'line-through text-gray-400'
                                    : 'text-gray-900'
                                }`}
                              >
                                {item.food?.name}
                              </p>
                              {item.food?.prepTime && (
                                <p className="text-[11px] text-gray-400">
                                  ⏱️ Est. {item.food.prepTime} mins
                                </p>
                              )}
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                              isChecked
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-5 pt-0 mt-auto">
                  {isPending && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'CONFIRMED')}
                      disabled={isUpdating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Check className="h-5 w-5" /> Accept Order
                    </button>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'PREPARING')}
                      disabled={isUpdating}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Play className="h-5 w-5" fill="currentColor" /> Start Cooking
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'READY')}
                      disabled={isUpdating}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-5 w-5" /> Mark as Ready for Pickup
                    </button>
                  )}

                  {isReady && (
                    <div className="w-full bg-emerald-50 text-emerald-800 font-bold py-3 px-4 rounded-2xl border border-emerald-200 text-center text-xs flex items-center justify-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Dispatched to Counter — Waiting for Handover
                    </div>
                  )}

                  {order.status === 'COMPLETED' && (
                    <div className="w-full bg-gray-100 text-gray-600 font-bold py-3 px-4 rounded-2xl text-center text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Handed Over & Completed
                    </div>
                  )}

                  {order.status === 'CANCELLED' && (
                    <div className="w-full bg-red-50 text-red-600 font-bold py-3 px-4 rounded-2xl text-center text-xs">
                      Order Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">
                {orders.length === 0 ? 'No Orders in Kitchen Yet' : 'No Tickets in This Section'}
              </h3>
              <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                {orders.length === 0
                  ? 'When a customer places an order from the menu or cart, the ticket will pop up here instantly with a notification.'
                  : activeTab === 'ACTIVE'
                  ? 'Active queue is clear! All active tickets have been prepared or handed over.'
                  : 'Try selecting a different tab or check All Tickets.'}
              </p>
              {orders.length === 0 && (
                <button
                  onClick={() => refetch()}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-lg shadow-orange-500/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh Live Queue
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
