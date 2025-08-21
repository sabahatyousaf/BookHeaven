import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config";

const { BACKEND_API_URL } = CONFIG;

export const register = createAsyncThunk(
  "super-admin/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/signup-super-admin`,
        formData
      );

      return response.data;
    } catch (error) {
      console.error("Register Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data);
    }
  }
);

export const login = createAsyncThunk(
  "super-admin/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/signin-super-admin`,
        loginData
      );

      const { token, data } = response.data;
      const user = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
      };

      localStorage.setItem("authToken", token);

      return { user, token };
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data);
    }
  }
);

export const logout = createAsyncThunk(
  "super-admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/logout-super-admin`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Unknown error occurred." }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
