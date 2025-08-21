import React from "react";
import { Routes, Route } from "react-router-dom";
import AppNavigator from "./AppNavigator";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../redux/store/store";

const RootNavigator = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route path="/*" element={<AppNavigator />} />
        </Routes>
      </PersistGate>
    </Provider>
  );
};

export default RootNavigator;
