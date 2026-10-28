import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetAnalyticsQuery } from '../redux/analyticsApiSlice';
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../redux/orderApiSlice';
import { useGetUsersQuery } from '../redux/userApiSlice';
import {
  Crown,
  ChefHat,
  ShoppingBag,
  Clock,
  DollarSign,
  Users,
  Utensils,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  TrendingUp,
  Tag,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Receipt,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ORDERS'); // 'ORDERS', 'ANALYTICS'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const { data: analytics, isLoading: isAnalyticsLoading, refetch: refetchAnalytics } = useGetAnalyticsQuery();
  const { data: orders = [], isLoading: isOrdersLoading, refetch: refetchOrders } = useGetAllOrdersQuery();
  const { data: users = [] } = useGetUsersQuery();

  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();

  // Real-time socket listener for live operational updates
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('new_order', (order) => {
      toast.success(`New order #${order.id} received!`, { icon: '🔔' });
      refetchOrders();
      refetchAnalytics();
    });

    socket.on('order_status_changed', () => {
      refetchOrders();
      refetchAnalytics();
    });

    return () => socket.disconnect();
  }, [refetchOrders, refetchAnalytics]);

  const handleStatusOverride = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to update order status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'READY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'KITCHEN' && ['CONFIRMED', 'PREPARING'].includes(order.status)) ||
      (statusFilter === 'READY' && order.status === 'READY') ||
      order.status === statusFilter;

    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.items?.some((item) =>
        item.food?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  const ordersInKitchenCount = orders.filter((o) =>
    ['CONFIRMED', 'PREPARING'].includes(o.status)
  ).length;

  const ordersReadyCount = orders.filter((o) => o.status === 'READY').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-orange-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Master Authority Header */}
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Master Admin Authority</h1>
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Full System Control
                  </span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm font-medium mt-1">
                  Monitor live kitchen cooking, counter handovers, customer orders, user roles, and menu catalog.
                </p>
              </div>
            </div>

            {/* Quick Authority Role Peeks */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <Link
                to="/dashboard/kitchen"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                title="Open live Kitchen Display"
              >
                <ChefHat className="h-4 w-4 text-orange-400" />
                Kitchen View
              </Link>
              <Link
                to="/dashboard/staff"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                title="Open Counter Pickup View"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
                Counter View
              </Link>
              <Link
                to="/dashboard/admin/menu"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                title="Manage Food Items and Categories"
              >
                <Utensils className="h-4 w-4 text-amber-400" />
                Menu Catalog
              </Link>
              <Link
                to="/dashboard/admin/users"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-orange-500/25"
                title="Assign User Permissions and Roles"
              >
                <Shield className="h-4 w-4 text-white" />
                User Roles ({users.length})
              </Link>
            </div>

          </div>
        </div>

        {/* Real-time KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">₹{analytics?.totalRevenue || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{analytics?.totalOrders || orders.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Kitchen</p>
              <p className="text-2xl font-black text-orange-600 mt-0.5">{ordersInKitchenCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ready at Counter</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{ordersReadyCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Campus Users</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{users.length}</p>
            </div>
          </div>

        </div>

        {/* Main Tab Controls */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center gap-2 pb-4 px-6 text-sm font-extrabold border-b-2 transition ${
              activeTab === 'ORDERS'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            Live Operations & All Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-2 pb-4 px-6 text-sm font-extrabold border-b-2 transition ${
              activeTab === 'ANALYTICS'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Popular Dishes & Sales
          </button>
        </div>

        {/* TAB 1: LIVE ORDERS MONITOR & MASTER OVERRIDE */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
              
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search order #, customer, or dish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-xs font-medium"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {[
                  { key: 'ALL', label: 'All Orders' },
                  { key: 'PENDING', label: 'Pending' },
                  { key: 'KITCHEN', label: 'In Kitchen' },
                  { key: 'READY', label: 'Ready at Counter' },
                  { key: 'COMPLETED', label: 'Completed' },
                  { key: 'CANCELLED', label: 'Cancelled' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                      statusFilter === tab.key
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {isOrdersLoading ? (
                <div className="py-20 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3" />
                  <p className="text-xs font-bold">Loading live orders...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider">
                        <th className="p-4">Order ID & Time</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Items Ordered</th>
                        <th className="p-4">Total & Payment</th>
                        <th className="p-4">Status & Authority Override</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/70 transition">
                          
                          {/* Order ID & Time */}
                          <td className="p-4">
                            <span className="font-black text-gray-900 text-sm block">
                              #{order.id.toString().padStart(4, '0')}
                            </span>
                            <span className="text-gray-400 font-medium text-[11px]">
                              {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </td>

                          {/* Customer Details */}
                          <td className="p-4">
                            <p className="font-extrabold text-gray-900 text-xs">
                              {order.user?.name || 'Guest Student'}
                            </p>
                            <p className="text-gray-400 text-[11px] truncate max-w-[140px]">
                              {order.user?.email || 'N/A'}
                            </p>
                          </td>

                          {/* Items Summary */}
                          <td className="p-4">
                            <div className="space-y-1 max-w-xs">
                              {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-[10px]">
                                    {item.quantity}x
                                  </span>
                                  <span className="font-bold text-gray-800 truncate">
                                    {item.food?.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Price & Payment */}
                          <td className="p-4">
                            <p className="font-black text-gray-900 text-sm">
                              ₹{order.finalAmount}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-gray-500 uppercase">
                                {order.payment?.method || 'CASH'}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                                  order.payment?.status === 'SUCCESS'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {order.payment?.status || 'PENDING'}
                              </span>
                            </div>
                          </td>

                          {/* Status & Master Override Dropdown */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>

                              {/* Admin Direct Override Dropdown */}
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusOverride(order.id, e.target.value)}
                                disabled={isUpdatingStatus}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold rounded-lg px-2 py-1 outline-none focus:border-orange-500 cursor-pointer"
                                title="Admin Authority: Change status directly"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="PREPARING">PREPARING (Cooking)</option>
                                <option value="READY">READY (Counter)</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                          </td>

                          {/* View Modal Action */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl font-bold text-xs transition inline-flex items-center gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Details
                            </button>
                          </td>

                        </tr>
                      ))}

                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-gray-400">
                            <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="font-bold text-gray-600">No orders match your filter</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: POPULAR ITEMS & CATALOG OVERVIEW */}
        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Top Selling Food Dishes
              </h2>
              <div className="space-y-4">
                {analytics?.popularFoods?.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition">
                    <div className="w-8 text-center font-black text-gray-400 text-sm">#{index + 1}</div>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-400">
                        <Utensils className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{item.totalSold} total student orders</p>
                    </div>
                    <div className="text-orange-600 font-extrabold text-sm flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Popular
                    </div>
                  </div>
                ))}
                {(!analytics?.popularFoods || analytics.popularFoods.length === 0) && (
                  <p className="text-gray-400 text-center py-8 font-medium text-xs">No food orders recorded yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-600 to-amber-500 text-white rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="font-black text-lg">Canteen Coupons</h3>
                <p className="text-xs text-white/90">
                  Active promo codes used by students at cart checkout.
                </p>
                <div className="space-y-2">
                  <div className="bg-white/10 rounded-2xl p-3 flex justify-between items-center text-xs">
                    <span className="font-black">CAMPUS20</span>
                    <span className="bg-white text-orange-600 px-2 py-0.5 rounded-md font-extrabold">20% OFF</span>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3 flex justify-between items-center text-xs">
                    <span className="font-black">FLAT50</span>
                    <span className="bg-white text-orange-600 px-2 py-0.5 rounded-md font-extrabold">₹50 OFF</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-gray-900 text-sm">System Authority Shortcut</h3>
                <Link
                  to="/dashboard/admin/users"
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-bold text-xs transition"
                >
                  <span>Assign Staff & Kitchen Roles</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard/admin/menu"
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-bold text-xs transition"
                >
                  <span>Edit Menu Items & Prices</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Order Detail Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <span className="font-extrabold text-gray-900 text-sm">
                  Order Details #{selectedOrderDetails.id}
                </span>
                <p className="text-[11px] text-gray-400">
                  {format(new Date(selectedOrderDetails.createdAt), 'dd MMM yyyy • h:mm a')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">CUSTOMER</span>
                  <span className="font-extrabold text-gray-900">{selectedOrderDetails.user?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">EMAIL</span>
                  <span className="font-medium text-gray-700">{selectedOrderDetails.user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">STATUS</span>
                  <span className={`px-2 py-0.5 rounded font-black uppercase text-[10px] ${getStatusBadge(selectedOrderDetails.status)}`}>
                    {selectedOrderDetails.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-gray-900 mb-2 uppercase tracking-wider text-[11px]">
                  Ordered Items
                </h4>
                <div className="space-y-2 border-t border-b border-gray-100 py-3">
                  {selectedOrderDetails.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 font-black flex items-center justify-center text-[10px]">
                          {item.quantity}
                        </span>
                        <span className="font-bold text-gray-800">{item.food?.name}</span>
                      </div>
                      <span className="font-black text-gray-900">₹{item.priceAtTime * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrderDetails.totalAmount}</span>
                </div>
                {selectedOrderDetails.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{selectedOrderDetails.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Grand Total</span>
                  <span className="text-orange-600 text-base">₹{selectedOrderDetails.finalAmount}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-orange-500 text-white rounded-xl font-bold text-xs transition"
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
