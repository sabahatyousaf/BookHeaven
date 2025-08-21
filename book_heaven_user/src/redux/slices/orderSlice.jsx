import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated.');
    return token;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch token.');
  }
};

export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (orderData, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);

      // Ensure we're using the correct field names that match the backend
      const backendPayload = {
        shippingAddress: orderData.shippingAddress,
        shippingFee: orderData.shippingFee.toString(),
        paymentMethod: orderData.paymentMethod,
        totalAmount: orderData.totalAmount,
        items: orderData.items.map(item => ({
          bookId: item.productId, // Changed from productId to bookId to match backend
          quantity: item.quantity,
        })),
      };

      const response = await axios.post(
        `${BASE_URL}/order/place-order`,
        backendPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllOrders = createAsyncThunk(
  'order/getAllOrders',
  async (_, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    const token = await getToken(rejectWithValue);
    try {
      const response = await axios.get(`${BASE_URL}/order/get-all-orders`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred.');
    }
  },
);

export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (orderId, {rejectWithValue}) => {
    const token = await getToken(rejectWithValue);
    try {
      const response = await axios.get(
        `${BASE_URL}/order/get-order-by-orderId/${orderId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch maintenance request.',
      );
    }
  },
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(placeOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getOrderById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          order => order._id === action.payload._id,
        );
        if (index >= 0) {
          state.orders[index] = action.payload;
        } else {
          state.orders.push(action.payload);
        }
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
