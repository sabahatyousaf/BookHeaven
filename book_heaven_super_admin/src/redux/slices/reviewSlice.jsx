import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

export const getAllReviews = createAsyncThunk(
  "review/getAllReviews",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/review/get-all-reviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.reviews;
    } catch (error) {
      console.error("Error fetching reviews:", error.response?.data); // Log error
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const getReviewById = createAsyncThunk(
  "review/getReviewById",
  async (reviewId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/review/get-review-by-id/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.review;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (reviewId, { getState, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      // Find the review in the state to get the bookId
      const state = getState();
      const review = state.reviews.reviews.find((r) => r._id === reviewId);

      if (!review) {
        return rejectWithValue("Review not found.");
      }

      // Extract bookId from the review object
      const bookId = review.bookId._id; // Access the _id field of the bookId object

      // Send DELETE request to the backend
      const response = await axios.delete(
        `${BACKEND_API_URL}/review/delete-review/${bookId}/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { bookId, reviewId };
    } catch (error) {
      console.error(
        "Delete Review Error:",
        error.response?.data || error.message
      ); // Log detailed error
      return rejectWithValue(
        error.response?.data || "An error occurred while deleting the review."
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload; // Correctly assign the payload
      })
      .addCase(getAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = action.payload;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setReviews } = reviewSlice.actions;

export default reviewSlice.reducer;
