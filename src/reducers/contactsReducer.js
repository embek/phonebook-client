export const initialState = {
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
    }
}

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

export function contactsReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_MODAL':
            return { ...state, modal: action.payload };

        case 'SET_QUERY':
            return { ...state, query: action.payload };

        case 'LOAD_CONTACTS_SUCCESS':
            return { ...state, contacts: action.payload };

        case 'LOAD_CONTACTS_FAILED':
            return {
                ...state,
                contacts: filterAndSortContacts(action.payload, state.query)
            };

        case 'UPDATE_CONTACT': {
            const { id, changes, status } = action.payload;
            const updatedContacts = state.contacts.map(contact =>
                contact.id === id ? { ...contact, ...changes, status } : contact
            );
            const filteredContacts = filterAndSortContacts(updatedContacts, state.query);
            sessionStorage.setItem('local_contacts', JSON.stringify(updatedContacts));
            return {
                ...state,
                contacts: filteredContacts
            };
        }

        case 'DELETE_CONTACT': {
            const updatedContacts = state.contacts.filter(c => c.id !== action.payload);
            const filteredContacts = filterAndSortContacts(updatedContacts, state.query);
            sessionStorage.setItem('local_contacts', JSON.stringify(updatedContacts));
            return {
                ...state,
                contacts: filteredContacts
            };
        }

        default:
            return state;
    }
}