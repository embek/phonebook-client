// import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import '@fortawesome/fontawesome-free';

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorPage from './components/ErrorPage';
import PhonebookPage from './components/PhonebookPage';
import AddPage from './components/AddPage';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from './reducers';
import { Provider } from 'react-redux';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react'

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = createStore(persistedReducer, applyMiddleware(thunk))
const persistor = persistStore(store)

const router = createBrowserRouter([
  {
    path: "/",
    element: <PhonebookPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/add",
    element: <AddPage />,
  },
]);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider >
  );
}

export default App;