import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../../redux/features/userSlice"; // adjust path if needed
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";

// import {thunk} from "redux-thunk";

const persistConfig = {
  key: "root",

  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // disable serializable check for redux-persist
    }),
});

export const persistor = persistStore(store);
