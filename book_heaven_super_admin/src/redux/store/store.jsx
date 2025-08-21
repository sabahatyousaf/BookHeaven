import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import authReducer from "../slices/authSlice";
import userReducer from "../slices/userSlice";
import bookReducer from "../slices/bookSlice";
import reviewReducer from "../slices/reviewSlice";
import orderReducer from "../slices/orderSlice";

const localStorageWrapper = {
  getItem: (key) => {
    return new Promise((resolve) => {
      resolve(localStorage.getItem(key));
    });
  },
  setItem: (key, value) => {
    return new Promise((resolve) => {
      localStorage.setItem(key, value);
      resolve();
    });
  },
  removeItem: (key) => {
    return new Promise((resolve) => {
      localStorage.removeItem(key);
      resolve();
    });
  },
};

const persistConfig = {
  key: "root",
  storage: localStorageWrapper,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  books: bookReducer,
  reviews: reviewReducer,
  orders: orderReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/REHYDRATE"],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
