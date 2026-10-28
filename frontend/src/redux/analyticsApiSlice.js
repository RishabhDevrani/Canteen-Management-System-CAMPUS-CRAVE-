import { apiSlice } from './apiSlice';

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => '/analytics',
      providesTags: ['Analytics', 'Order'], // Re-fetch analytics when orders change
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApiSlice;
