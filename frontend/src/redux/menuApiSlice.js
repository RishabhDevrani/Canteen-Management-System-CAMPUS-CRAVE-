import { apiSlice } from './apiSlice';

export const menuApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => '/menu/categories',
      providesTags: ['Category'],
    }),
    getFoods: builder.query({
      query: () => '/menu/foods',
      providesTags: ['Food'],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/menu/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    createFood: builder.mutation({
      query: (data) => ({
        url: '/menu/foods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Food', 'Analytics'],
    }),
    updateFood: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/menu/foods/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Food', 'Analytics'],
    }),
    updateFoodAvailability: builder.mutation({
      query: ({ id, availability }) => ({
        url: `/menu/foods/${id}/availability`,
        method: 'PATCH',
        body: { availability },
      }),
      invalidatesTags: ['Food'],
    }),
    deleteFood: builder.mutation({
      query: (id) => ({
        url: `/menu/foods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Food', 'Analytics'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/menu/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category', 'Food'],
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Food'],
    }),
    getReviews: builder.query({
      query: (foodId) => `/reviews/food/${foodId}`,
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetFoodsQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useUpdateFoodAvailabilityMutation,
  useDeleteFoodMutation,
  useCreateReviewMutation,
  useGetReviewsQuery,
} = menuApiSlice;
