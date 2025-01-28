import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import PhonebookPage from './features/PhonebookPage';
import AddPage from './features/AddPage';
import ErrorPage from './components/ErrorPage';
import AvatarPage from './features/AvatarPage';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<PhonebookPage />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/add"
            element={<AddPage />}
          />
          <Route
            path="/avatar/:id"
            element={<AvatarPage />}
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;