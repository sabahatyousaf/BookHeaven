import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CONFIG from "../config/Config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

export const getSuperAdmin = createAsyncThunk(
  "super-admin/getSuperAdmin",
  async (userId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/super-admin/get-super-admin-by-id/${userId}`, // Update URL
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.superAdmin; // Return the single super admin
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    superAdmin: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.superAdmin = action.payload;
      })
      .addCase(getSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
