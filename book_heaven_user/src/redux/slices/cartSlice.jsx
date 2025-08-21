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

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({bookId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BASE_URL}/cart/add-to-cart`,
        {bookId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({bookId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BASE_URL}/cart/remove-from-cart`,
        {bookId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const removeAllFromCart = createAsyncThunk(
  'cart/removeAllFromCart',
  async ({bookId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.delete(
        `${BASE_URL}/cart/remove-all-cart-items`,
        {
          data: {bookId}, // Correct way to send request body in DELETE request
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Remove All Response:', response.data);
      return {bookId};
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllCartItems = createAsyncThunk(
  'cart/getAllCartItems',
  async (_, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(`${BASE_URL}/cart/get-all-cart-items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateCartItem: (state, action) => {
      const {bookId, quantity} = action.payload;
      const itemIndex = state.cartItems.findIndex(
        item => item.bookId._id === bookId,
      );
      if (itemIndex !== -1) {
        state.cartItems[itemIndex].quantity = quantity;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addToCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeFromCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeAllFromCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAllFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = state.cartItems.filter(
          item => item.bookId._id !== action.payload.bookId,
        );
      })
      .addCase(removeAllFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllCartItems.pending, state => {
        state.loading = true;
      })
      .addCase(getAllCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.loading = false;
      })
      .addCase(getAllCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {updateCartItem} = cartSlice.actions;

export default cartSlice.reducer;
