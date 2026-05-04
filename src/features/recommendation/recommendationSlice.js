import { createApiSlice } from "../createApiSlice";
import { recommendationThunks } from "../domainThunks";
export const { fetchRecommendations, trackRecommendationInteraction, fetchTrendingProducts } = recommendationThunks;
export default createApiSlice({ name: "recommendation", thunks: recommendationThunks }).reducer;
