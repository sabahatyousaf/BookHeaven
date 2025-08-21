import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/order/get-all-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.orders;
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data); // Log error
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (orderId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/order/get-order-by-id/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status }, { getState }) => {
    const token = getToken();

    // Make the API call to update the order status
    const response = await axios.patch(
      `${BACKEND_API_URL}/order/update-order-status/${orderId}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Update the local state with the new order status
    const { orders } = getState().orders;
    return orders.map((order) =>
      order._id === orderId
        ? { ...order, status: response.data.order.status }
        : order
    );
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "order/payment/updatePaymentStatus",
  async ({ orderId, payment }, { getState }) => {
    const token = getToken();

    // Make the API call to update the order payment status
    const response = await axios.patch(
      `${BACKEND_API_URL}/order/payment/update-payment-status/${orderId}`,
      { payment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Update the local state with the new order payment status
    const { orders } = getState().orders;
    return orders.map((order) =>
      order._id === orderId
        ? { ...order, payment: response.data.order.payment }
        : order
    );
  }
);

export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (orderId, { rejectWithValue, getState }) => {
    const token = getToken();

    try {
      await axios.delete(`${BACKEND_API_URL}/order/delete-order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { orders } = getState().orders;
      return orders.filter((order) => order._id !== orderId);
    } catch (error) {
      console.error("Error deleting order:", error.response?.data);
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload; // Correctly assign the payload
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
         .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setOrders } = orderSlice.actions;

export default orderSlice.reducer;
