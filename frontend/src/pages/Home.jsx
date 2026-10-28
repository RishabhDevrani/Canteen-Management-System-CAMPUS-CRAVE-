import { useState, useMemo } from 'react';
import {
  Search,
  Flame,
  Clock,
  Star,
  ShoppingBag,
  Loader2,
  Sparkles,
  Tag,
  ShieldCheck,
  CheckCircle,
  Copy,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCategoriesQuery, useGetFoodsQuery } from '../redux/menuApiSlice';
import { addToCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';

export default function Home() {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dietFilter, setDietFilter] = useState('ALL'); // ALL, VEG, NON_VEG

  const cartItems = useSelector((state) => state.cart.items);

  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: foods = [], isLoading: isFoodsLoading } = useGetFoodsQuery();

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied!`);
  };

  const getItemCartQty = (foodId) => {
    const item = cartItems.find((i) => i.id === foodId);
    return item ? item.quantity : 0;
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        activeCategory === 'All' || food.category?.name === activeCategory;
      const matchesDiet =
        dietFilter === 'ALL' ||
        (dietFilter === 'VEG' && food.isVeg) ||
        (dietFilter === 'NON_VEG' && !food.isVeg);
      return matchesSearch && matchesCategory && matchesDiet;
    });
  }, [foods, searchTerm, activeCategory, dietFilter]);

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-orange-50/50 via-white to-transparent pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-gray-100">
        
        {/* Glow blur circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-14">
          
          {/* Left Text */}
          <div className="w-full lg:w-7/12 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/80 border border-orange-200/60 text-orange-700 font-extrabold text-xs mb-6 shadow-sm">
              <Sparkles className="h-4 w-4 text-orange-600 fill-orange-500" />
              <span>Campus Food Ordering Reimagined</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.08] mb-6">
              Skip The Wait, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500">
                Savor Every Bite.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 font-medium mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Order fresh meals straight from the campus kitchen. No standing in long lines—pick up hot food right on time.
            </p>
            
            {/* Search Box */}
            <div className="relative max-w-xl mx-auto lg:mx-0 shadow-xl shadow-gray-200/60 rounded-2xl bg-white p-2 border border-gray-200/70 flex items-center gap-2 transition focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
              <div className="pl-3 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                className="w-full py-2.5 px-2 text-gray-800 outline-none bg-transparent placeholder-gray-400 font-medium text-sm sm:text-base"
                placeholder="Search burgers, pizzas, noodles, coffee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2"
                >
                  Clear
                </button>
              )}
              <button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-6 sm:px-8 py-3 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-orange-500/25 flex-shrink-0">
                Search
              </button>
            </div>

            {/* Quick keyword chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4 text-xs font-bold text-gray-400">
              <span>Popular searches:</span>
              {['Burger', 'Pizza', 'Masala', 'Coffee'].map((kw) => (
                <button
                  key={kw}
                  onClick={() => setSearchTerm(kw)}
                  className="bg-white hover:bg-orange-50 text-gray-600 hover:text-orange-600 px-3 py-1 rounded-full border border-gray-200 transition"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Right Hero Image with Floating Badges */}
          <div className="w-full lg:w-5/12 relative flex justify-center">
            
            <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px]">
              
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-200 animate-spin [animation-duration:40s]" />
              
              <img 
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" 
                alt="Signature Campus Burger" 
                className="w-full h-full rounded-full object-cover shadow-2xl border-8 border-white"
              />

              {/* Floating Badge 1: 15-min pickup */}
              <div className="absolute -bottom-4 -left-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Preparation</p>
                  <p className="text-gray-900 font-extrabold text-sm">In 10-15 Mins</p>
                </div>
              </div>

              {/* Floating Badge 2: Star Rating */}
              <div className="absolute top-4 -right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="text-gray-900 font-black text-sm">4.8 / 5.0</p>
                  <p className="text-[10px] font-bold text-gray-400">Campus Choice</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Promotional Coupons Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 flex-shrink-0">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-black text-lg text-white">Student Specials Available!</span>
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium mt-0.5">
                Apply coupon during checkout for instant canteen bill discounts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div
              onClick={() => handleCopyCode('CAMPUS20')}
              className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-2xl px-4 py-2.5 flex items-center gap-3 transition"
            >
              <div>
                <p className="text-orange-400 font-black text-sm tracking-wide">CAMPUS20</p>
                <p className="text-[10px] text-gray-400">20% Off on ₹100+</p>
              </div>
              <Copy className="h-4 w-4 text-gray-400 group-hover:text-orange-400 transition" />
            </div>

            <div
              onClick={() => handleCopyCode('FLAT50')}
              className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-2xl px-4 py-2.5 flex items-center gap-3 transition"
            >
              <div>
                <p className="text-orange-400 font-black text-sm tracking-wide">FLAT50</p>
                <p className="text-[10px] text-gray-400">Flat ₹50 Off on ₹150+</p>
              </div>
              <Copy className="h-4 w-4 text-gray-400 group-hover:text-orange-400 transition" />
            </div>
          </div>

        </div>
      </div>

      {/* Categories & Dietary Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-4 border-b border-gray-200/70">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-600 mb-1">
              <Flame className="h-4 w-4" /> Freshly Prepared
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Explore Our Canteen Menu
            </h2>
          </div>

          {/* Veg / Non-Veg Toggle Filter */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setDietFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                dietFilter === 'ALL'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Dishes
            </button>
            <button
              onClick={() => setDietFilter('VEG')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                dietFilter === 'VEG'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-green-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 border border-white" />
              Veg Only
            </button>
            <button
              onClick={() => setDietFilter('NON_VEG')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                dietFilter === 'NON_VEG'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-red-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 border border-white" />
              Non-Veg
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        {isCategoriesLoading ? (
          <div className="flex items-center gap-2 text-orange-500 font-bold py-2">
            <Loader2 className="animate-spin h-5 w-5" /> Loading fresh menu categories...
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar">
            <button 
              onClick={() => setActiveCategory('All')}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition shadow-sm flex items-center gap-2 ${
                activeCategory === 'All' 
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-orange-500/25 shadow-md scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>🔥 All Items</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeCategory === 'All' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {foods.length}
              </span>
            </button>

            {categories.map((category) => (
              <button 
                key={category.id}
                onClick={() => setActiveCategory(category.name)}
                className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition shadow-sm flex items-center gap-2 ${
                  activeCategory === category.name 
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-orange-500/25 shadow-md scale-105' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span>{category.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeCategory === category.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {category._count?.foods ?? 0}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Foods Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {isFoodsLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="animate-spin h-10 w-10 text-orange-500 mb-3" />
            <p className="font-bold text-sm">Fetching dishes from the canteen kitchen...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredFoods.map((food) => {
              const inCartQty = getItemCartQty(food.id);

              return (
                <div
                  key={food.id}
                  className="bg-white rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100/90 flex flex-col relative"
                >
                  {/* Floating Rating Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-gray-900 shadow-sm flex items-center gap-1.5 z-10 border border-gray-100">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span>{food.rating || 4.5}</span>
                  </div>

                  {/* Out of Stock overlay tag */}
                  {!food.availability && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md z-10">
                      Out of Stock
                    </div>
                  )}

                  {/* Food Image */}
                  <div className="h-52 overflow-hidden relative m-2.5 rounded-[1.6rem] bg-gray-50">
                    <img 
                      src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60'} 
                      alt={food.name} 
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        !food.availability ? 'grayscale opacity-50' : ''
                      }`}
                    />
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6 pt-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Veg / Non-Veg Icon & Title */}
                      <div className="flex items-start gap-2.5 mb-1.5">
                        <div
                          className={`mt-1 w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${
                            food.isVeg ? 'border-green-600' : 'border-red-600'
                          }`}
                          title={food.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              food.isVeg ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          />
                        </div>

                        <h3 className="text-lg font-black text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                          {food.name}
                        </h3>
                      </div>

                      {/* Category & Prep Time */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-3">
                        <span>{food.category?.name || 'Canteen Special'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {food.prepTime} mins
                        </span>
                      </div>

                      {food.description && (
                        <p className="text-gray-500 text-xs font-medium line-clamp-2 mb-4 leading-relaxed">
                          {food.description}
                        </p>
                      )}
                    </div>

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                      <div>
                        <span className="text-xs text-gray-400 font-bold block">Price</span>
                        <span className="text-2xl font-black text-gray-900">₹{food.price}</span>
                      </div>

                      {food.availability ? (
                        <button 
                          onClick={() => {
                            dispatch(addToCart(food));
                            toast.success(`${food.name} added to bag!`, { icon: '🛒' });
                          }}
                          className={`h-11 px-5 rounded-2xl font-extrabold text-xs transition-all duration-300 flex items-center gap-2 shadow-md ${
                            inCartQty > 0
                              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25 scale-105'
                              : 'bg-gray-900 hover:bg-orange-500 text-white hover:shadow-orange-500/25'
                          }`}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>{inCartQty > 0 ? `Added (${inCartQty})` : 'Add to Bag'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed">
                          Unavailable
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
            
            {filteredFoods.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100 p-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800">No dishes found</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Try searching for something else or clear your filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                    setDietFilter('ALL');
                  }}
                  className="mt-4 px-5 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campus Perks & Info Footer Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-200">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 font-bold">
              ⚡
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-gray-900">Zero Waiting Lines</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Order on phone, grab food on counter.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 font-bold">
              🥗
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-gray-900">Fresh & Hygienic</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Cooked live with verified ingredients.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 font-bold">
              💳
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-gray-900">Flexible Payment</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Pay online or cash at pickup counter.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
