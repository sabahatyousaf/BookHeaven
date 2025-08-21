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

export const getLibraryBooks = createAsyncThunk(
  'library/getLibraryBooks',
  async (_, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    const token = await getToken(rejectWithValue);
    try {
      const response = await axios.get(`${BASE_URL}/user/get-library-books`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return response.data.library;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred.');
    }
  },
);

const librarySlice = createSlice({
  name: 'library',
  initialState: {
    library: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getLibraryBooks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLibraryBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.library = action.payload;
      })
      .addCase(getLibraryBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default librarySlice.reducer;
