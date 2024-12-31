import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PhonebookPage from './components/PhonebookPage';
import AddPage from './components/AddPage';
import ErrorPage from './components/ErrorPage';
import axios from "axios";

const api = axios.create({
  baseURL: 'http://192.168.1.20:3000/',
  timeout: 1000
});

function App() {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState({
    search: '',
    sortMode: 'ASC',
    limit: 10
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    contactIdToDelete: null
  });
  const [total, setTotal] = useState(0);

  const addContact = (name, phone) => {
    setContacts(prev => [...prev, { id: Date.now(), name, phone }]);
  };

  const removeContact = (id) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const updateContact = (id, name, phone) => {
    setContacts(prev => prev.map(contact =>
      contact.id === id ? { ...contact, name, phone } : contact
    ));
  };

  const loadContacts = async () => {
    try {
      const { data } = await api.get('api/phonebooks', {
        params: query
      });
      setContacts(data.phonebooks);
      setQuery(prev => ({
        ...prev,
        total: data.total
      }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PhonebookPage
              contacts={contacts}
              query={query}
              setQuery={setQuery}
              deleteModal={deleteModal}
              setDeleteModal={setDeleteModal}
              removeContact={removeContact}
              updateContact={updateContact}
              loadContacts={loadContacts}
            />
          }
          errorElement={<ErrorPage />}
        />
        <Route
          path="/add"
          element={<AddPage onAddContact={addContact} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;