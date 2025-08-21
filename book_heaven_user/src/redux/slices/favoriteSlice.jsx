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

export const addToFavorite = createAsyncThunk(
  'favorite/addToFavorite',
  async ({bookId}, {rejectWithValue}) => {
    try {
      console.log('Adding to favorite:', bookId);
      const token = await getToken(rejectWithValue);

      const response = await axios.post(
        `${BASE_URL}/favorite/add-to-favorite`,
        {bookId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Added to favorite successfully:', response.data);
      return response.data.user;
    } catch (error) {
      console.error(
        '❌ Add to favorite failed:',
        error.response?.data || error.message,
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const removeFromFavorite = createAsyncThunk(
  'favorite/removeFromFavorite',
  async ({bookId}, {rejectWithValue}) => {
    try {
      console.log('Removing from favorite:', bookId);
      const token = await getToken(rejectWithValue);

      const response = await axios.post(
        `${BASE_URL}/favorite/remove-to-favorite`,
        {bookId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Removed from favorite successfully:', response.data);
      return {bookId}; // Fix: Return only bookId to update state properly
    } catch (error) {
      console.error(
        '❌ Remove from favorite failed:',
        error.response?.data || error.message,
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllFavorites = createAsyncThunk(
  'favorite/getAllFavorites',
  async (_, {rejectWithValue}) => {
    try {
      const token = await getToken();

      if (!token) {
        console.error('❌ No token found, user not authenticated.');
        return rejectWithValue('User is not authenticated.');
      }

      const response = await axios.get(
        `${BASE_URL}/favorite/get-all-favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data.favorites; // Ensure the correct data structure
    } catch (error) {
      console.error(
        '❌ Fetch all favorites failed:',
        error.response?.data || error.message,
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState: {
    favorites: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addToFavorite.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites.push(action.payload);
      })
      .addCase(addToFavorite.rejected, (state, action) => {
        console.error('Add to favorite rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromFavorite.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = state.favorites.filter(
          fav => fav.bookId._id !== action.payload.bookId,
        );
      })

      .addCase(removeFromFavorite.rejected, (state, action) => {
        console.error('Remove from favorite rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllFavorites.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(getAllFavorites.rejected, (state, action) => {
        console.error('Fetch all favorites rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default favoriteSlice.reducer;
