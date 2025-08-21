import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';
import authReducer from '../slices/authSlice';
import userReducer from '../slices/userSlice';
import bookReducer from '../slices/bookSlice';
import favoriteReducer from '../slices/favoriteSlice';
import libraryReducer from '../slices/librarySlice';
import orderReducer from '../slices/orderSlice';
import cartReducer from '../slices/cartSlice';
import reviewReducer from '../slices/reviewSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'favorite'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  book: bookReducer,
  favorite: favoriteReducer,
  library: libraryReducer,
  order: orderReducer,
  cart: cartReducer,
  review: reviewReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable state warnings
    }),
});

const persistor = persistStore(store);

export {store, persistor};
