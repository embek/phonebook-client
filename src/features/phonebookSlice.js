import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api';

const initialState = {
    contacts: [],
    modal: {
        isOpen: false,
        contactIdToDelete: null
    },
    query: {
        limit: 10,
        sortMode: 'ASC',
        sortBy: 'name',
        search: ''
    },
    status: 'idle',
    error: null
};

const filterAndSortContacts = (contacts, query) => {
    const searchTerm = query.search.toLowerCase();
    const modifier = query.sortMode === 'ASC' ? 1 : -1;

    return contacts
        .sort((a, b) => {
            if ((!a.status?.sent) && b.status?.sent) return -1;
            if (a.status?.sent && (!b.status?.sent)) return 1;
            return modifier * a[query.sortBy].localeCompare(b[query.sortBy]);
        })
        .filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.phone.includes(searchTerm)
        )
        .slice(0, query.limit);
};

export const loadContacts = createAsyncThunk(
    'phonebook/loadContacts',
    async (query) => {
        const stored = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
        try {
            const { data } = await api.get('api/phonebooks', { params: query });
            const pending = stored.filter(c => !c.status?.sent);
            const remote = data.phonebooks
                .filter(server => !pending.find(local => local.id === server.id))
                .map(item => ({ ...item, status: { sent: true, operation: null } }));
            const merged = [...pending, ...remote];
            sessionStorage.setItem('local_contacts', JSON.stringify(merged));
            return merged;
        } catch (error) {
            return stored;
        }
    }
);

export const handleContactOperation = createAsyncThunk(
    'phonebook/handleOperation',
    async ({ operation, id, contactData }, { rejectWithValue }) => {
        try {
            switch (operation) {
                case 'delete':
                    await api.delete(`api/phonebooks/${id}`);
                    return { operation, id };

                case 'update':
                    await api.put(`api/phonebooks/${id}`, contactData);
                    return { operation, id, contactData, status: { sent: true, operation: null } };

                case 'retry-add':
                    const { data } = await api.post('api/phonebooks', contactData);
                    const stored = JSON.parse(sessionStorage.getItem('local_contacts'));
                    sessionStorage.setItem('local_contacts', JSON.stringify(stored.filter(c => c.id !== id)));
                    return {
                        operation,
                        id,
                        contactData: { ...contactData, id: data.id },
                        status: { sent: true, operation: null }
                    };

                default:
                    return rejectWithValue(`Unknown operation: ${operation}`);
            }
        } catch (error) {
            return rejectWithValue({ operation, id, contactData, error: error.message });
        }
    }
);

const phonebookSlice = createSlice({
    name: 'phonebook',
    initialState,
    reducers: {
        setModal: (state, action) => {
            state.modal = action.payload;
        },
        setQuery: (state, action) => {
            state.query = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadContacts.fulfilled, (state, action) => {
                state.contacts = action.payload;
                state.status = 'succeeded';
            })
            .addCase(loadContacts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(handleContactOperation.fulfilled, (state, action) => {
                const { operation, id, contactData, status } = action.payload;

                if (operation === 'delete') {
                    const updatedContacts = state.contacts.filter(c => c.id !== id);
                    state.contacts = filterAndSortContacts(updatedContacts, state.query);
                    sessionStorage.setItem('local_contacts', JSON.stringify(updatedContacts));
                } else {
                    const updatedContacts = state.contacts.map(contact =>
                        contact.id === id ? { ...contact, ...contactData, status } : contact
                    );
                    state.contacts = filterAndSortContacts(updatedContacts, state.query);
                    sessionStorage.setItem('local_contacts', JSON.stringify(updatedContacts));
                }
            })
            .addCase(handleContactOperation.rejected, (state, action) => {
                const { operation, id, contactData } = action.payload;
                if (operation !== 'retry-add') {
                    const updatedContacts = state.contacts.map(contact =>
                        contact.id === id
                            ? { ...contact, ...contactData, status: { sent: false, operation } }
                            : contact
                    );
                    state.contacts = filterAndSortContacts(updatedContacts, state.query);
                    sessionStorage.setItem('local_contacts', JSON.stringify(updatedContacts));
                }
            });
    }
});

export const { setModal, setQuery } = phonebookSlice.actions;
export default phonebookSlice.reducer;

