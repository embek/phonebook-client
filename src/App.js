import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PhonebookPage from './components/PhonebookPage';
import AddPage from './components/AddPage';
import ErrorPage from './components/ErrorPage';
import AvatarPage from './components/AvatarPage';
import './App.css';
import { useReducer } from 'react';
import contactsReducer from './reducers/contacts';
import CustomContext from './components/CustomContext';

function App() {
  const [state, dispatch] = useReducer(contactsReducer, {
    contacts: [],
    query: { limit: 10, sortMode: 'ASC', sortBy: 'name', search: '' },
    total: 0,
    modal: { isOpen: false, contactIdToDelete: null }
  });

  return (
    <CustomContext.Provider value={{ state, dispatch }}>
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
    </CustomContext.Provider>
  );
}

export default App;