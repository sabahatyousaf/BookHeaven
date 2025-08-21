import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

export const addBook = createAsyncThunk(
  "book/addBook",
  async (formData, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await axios.post(
        `${BACKEND_API_URL}/book/upload-book`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to upload book");
    }
  }
);

export const getAllBooks = createAsyncThunk(
  "book/getAllBooks",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/book/get-all-books`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.books;
    } catch (error) {
      console.error("Error fetching books:", error.response?.data); // Log error
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const getBookById = createAsyncThunk(
  "book/getBookById",
  async (bookId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/book/get-book-by-id/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.book;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const updateBook = createAsyncThunk(
  "book/updateBook",
  async ({ bookId, formData }, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await axios.patch(
        `${BACKEND_API_URL}/book/update-book/${bookId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update book");
    }
  }
);

export const deleteBook = createAsyncThunk(
  "book/deleteBook",
  async (bookId, { getState, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/book/delete-book/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { books } = getState().books;
      return books.filter((book) => book._id !== bookId);
    } catch (error) {
      console.error("Delete Error:", error.response?.data); // Log error message
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const bookSlice = createSlice({
  name: "books",
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {
    setBooks: (state, action) => {
      state.books = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.push(action.payload);
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload; // Correctly assign the payload
      })
      .addCase(getAllBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(getBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.push(action.payload);
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = action.payload;
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setBooks } = bookSlice.actions;

export default bookSlice.reducer;
