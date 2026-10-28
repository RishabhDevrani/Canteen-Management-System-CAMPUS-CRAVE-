import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetCategoriesQuery,
  useGetFoodsQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useUpdateFoodAvailabilityMutation,
  useDeleteFoodMutation,
} from '../redux/menuApiSlice';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Package,
  Layers,
  Utensils,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const initialFoodForm = {
  name: '',
  description: '',
  price: '',
  categoryId: '',
  prepTime: '',
  image: '',
  isVeg: true,
  availability: true,
};

export default function AdminMenuManagement() {
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: foods = [], isLoading: isFoodsLoading } = useGetFoodsQuery();

  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation();
  const [createFood, { isLoading: isCreatingFood }] = useCreateFoodMutation();
  const [updateFood, { isLoading: isUpdatingFood }] = useUpdateFoodMutation();
  const [updateFoodAvailability] = useUpdateFoodAvailabilityMutation();
  const [deleteFood, { isLoading: isDeletingFood }] = useDeleteFoodMutation();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [dietaryFilter, setDietaryFilter] = useState('ALL'); // ALL, VEG, NON_VEG

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [foodForm, setFoodForm] = useState(initialFoodForm);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) {
      toast.error('Category name is required');
      return;
    }
    try {
      await createCategory({ name }).unwrap();
      toast.success(`Category "${name}" added!`);
      setNewCategoryName('');
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Only empty categories can be deleted.`)) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Category removed');
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to delete category');
    }
  };

  const handleToggleAvailability = async (food) => {
    try {
      const newStatus = !food.availability;
      await updateFoodAvailability({ id: food.id, availability: newStatus }).unwrap();
      toast.success(`${food.name} is now ${newStatus ? 'Live in Stock' : 'Out of Stock'}`);
    } catch (err) {
      toast.error('Failed to change availability status');
    }
  };

  const handleDeleteFood = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await deleteFood(id).unwrap();
      toast.success(res?.message || 'Food item removed');
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to delete food');
    }
  };

  const openAddModal = () => {
    setEditingFoodId(null);
    setFoodForm({
      ...initialFoodForm,
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (food) => {
    setEditingFoodId(food.id);
    setFoodForm({
      name: food.name,
      description: food.description || '',
      price: String(food.price),
      categoryId: String(food.categoryId),
      prepTime: String(food.prepTime),
      image: food.image || '',
      isVeg: food.isVeg,
      availability: food.availability,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!foodForm.name.trim() || !foodForm.price || !foodForm.categoryId || !foodForm.prepTime) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      name: foodForm.name.trim(),
      price: Number(foodForm.price),
      categoryId: Number(foodForm.categoryId),
      prepTime: Number(foodForm.prepTime),
      isVeg: foodForm.isVeg,
      availability: foodForm.availability,
      description: foodForm.description.trim() || undefined,
      image: foodForm.image.trim() || undefined,
    };

    try {
      if (editingFoodId) {
        await updateFood({ id: editingFoodId, ...payload }).unwrap();
        toast.success('Food item updated!');
      } else {
        await createFood(payload).unwrap();
        toast.success('Food item added to menu!');
      }
      setIsModalOpen(false);
      setEditingFoodId(null);
    } catch (err) {
      toast.error(err?.data?.error || 'Operation failed');
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'ALL' || String(food.categoryId) === selectedCategoryFilter;
    const matchesDietary =
      dietaryFilter === 'ALL' ||
      (dietaryFilter === 'VEG' && food.isVeg) ||
      (dietaryFilter === 'NON_VEG' && !food.isVeg);
    return matchesSearch && matchesCategory && matchesDietary;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard/admin"
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-orange-500 hover:border-orange-200 transition shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Menu & Food Management
              </h1>
            </div>
            <p className="text-gray-500 font-medium mt-1 ml-11">
              Add food items, update prices, toggle availability, and manage categories.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-5 w-5" />
            Add New Food Item
          </button>
        </div>

        {/* Category Management Row */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
              <Layers className="h-5 w-5 text-orange-500" />
              <span>Categories ({categories.length})</span>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm font-medium w-48 sm:w-64"
              />
              <button
                type="submit"
                disabled={isCreatingCategory}
                className="bg-gray-900 hover:bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition"
              >
                {isCreatingCategory ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>

          {/* Category Badges with Delete button */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Items ({foods.length})
            </button>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`group flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-full text-xs font-bold transition border ${
                  selectedCategoryFilter === String(cat.id)
                    ? 'bg-orange-50 border-orange-300 text-orange-600'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span
                  className="cursor-pointer"
                  onClick={() => setSelectedCategoryFilter(String(cat.id))}
                >
                  {cat.name} ({cat._count?.foods ?? 0})
                </span>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  title="Delete category"
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="h-5 w-5 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search dishes or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-medium text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-gray-500">Dietary:</span>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['ALL', 'VEG', 'NON_VEG'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDietaryFilter(type)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    dietaryFilter === type
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'VEG' ? 'Veg Only' : 'Non-Veg'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Food Items Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {isFoodsLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading food items...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Item Details</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Prep Time</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredFoods.map((food) => (
                    <tr key={food.id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {food.image ? (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="h-14 w-14 rounded-2xl object-cover shadow-sm border border-gray-100"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-400">
                              <Utensils className="h-6 w-6" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  food.isVeg ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                              />
                              <span className="font-bold text-gray-900 text-base">{food.name}</span>
                            </div>
                            {food.description && (
                              <p className="text-gray-400 text-xs line-clamp-1 mt-0.5 max-w-sm">
                                {food.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-gray-600">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                          {food.category?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="p-4 font-extrabold text-gray-900 text-base">
                        ₹{food.price}
                      </td>

                      <td className="p-4 font-medium text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{food.prepTime} mins</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAvailability(food)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                            food.availability
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {food.availability ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" /> In Stock
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" /> Out of Stock
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(food)}
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition"
                            title="Edit Item"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(food.id, food.name)}
                            disabled={isDeletingFood}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredFoods.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-bold text-gray-600 text-base">No food items found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try adjusting your search or filters, or add a new food item.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">
                {editingFoodId ? 'Edit Food Item' : 'Add New Food Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={foodForm.name}
                    onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-medium text-sm"
                    placeholder="e.g. Crispy Veggie Burger"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={foodForm.categoryId}
                    onChange={(e) => setFoodForm({ ...foodForm, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-medium text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-medium text-sm"
                    placeholder="e.g. 150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Prep Time (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={foodForm.prepTime}
                    onChange={(e) => setFoodForm({ ...foodForm, prepTime: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-medium text-sm"
                    placeholder="e.g. 15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  value={foodForm.image}
                  onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-medium text-sm"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-medium text-sm resize-none"
                  placeholder="Brief tasty description..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={foodForm.isVeg}
                    onChange={(e) => setFoodForm({ ...foodForm, isVeg: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span>Vegetarian Dish</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={foodForm.availability}
                    onChange={(e) => setFoodForm({ ...foodForm, availability: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <span>Available / In Stock</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFood || isUpdatingFood}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-sm text-white shadow-md shadow-orange-500/20 transition disabled:opacity-50"
                >
                  {isCreatingFood || isUpdatingFood
                    ? 'Saving...'
                    : editingFoodId
                    ? 'Save Changes'
                    : 'Add Food Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
