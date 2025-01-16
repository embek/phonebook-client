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
};

export function rootReducer(state = initialState, action) {
    switch (action.type) {
        case 'LOAD_CONTACTS':
            return { ...state, contacts: action.payload };

        case 'UPDATE_CONTACT':
            return {
                ...state,
                contacts: state.contacts.map(contact =>
                    contact.id === action.payload.id ? action.payload : contact
                )
            };

        case 'REMOVE_CONTACT':
            return {
                ...state,
                contacts: state.contacts.filter(contact => contact.id !== action.payload),
                modal: initialState.modal
            };

        case 'ADD_CONTACT':
            return {
                ...state,
                contacts: [...state.contacts, { ...action.payload, status: { sent: true, operation: null } }]
            };

        case 'ADD_CONTACT_ERROR':
            return {
                ...state,
                contacts: state.contacts.map(contact =>
                    contact.id === action.payload ? { ...contact, status: { sent: false, operation: 'add' } } : contact
                )
            };

        case 'TOGGLE_MODAL':
            return {
                ...state,
                modal: {
                    isOpen: action.payload.isOpen,
                    contactIdToDelete: action.payload.contactId
                }
            };

        case 'SET_QUERY':
            return {
                ...state,
                query: { ...state.query, ...action.payload }
            };

        default:
            return state;
    }
}
