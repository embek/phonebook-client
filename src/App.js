import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PhonebookPage from './components/PhonebookPage';
import AddPage from './components/AddPage';
import ErrorPage from './components/ErrorPage';
import AvatarPage from './components/AvatarPage';
import { CustomContextProvider } from './components/CustomContext';
import './App.css';

function App() {
  return (
    <CustomContextProvider>
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
    </CustomContextProvider>
  );
}

export default App;