
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

export const getAllReviews = createAsyncThunk(
  'reviews/getAllReviews',
  async (_, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    const token = await getToken(rejectWithValue);
    try {
      const response = await axios.get(`${BASE_URL}/review/get-all-reviews`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data.reviews;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred.');
    }
  },
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAllReviews.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reviewSlice.reducer;
