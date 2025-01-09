export default function contactsReducer(state, action) {
    switch (action.type) {
        case 'LOAD_CONTACTS':
            return { ...state, contacts: action.payload };
        case 'SET_QUERY':
            return { ...state, query: { ...state.query, ...action.payload } };
        case 'SET_TOTAL':
            return { ...state, total: action.payload };
        case 'TOGGLE_MODAL':
            return { 
                ...state, 
                modal: {
                    isOpen: action.payload.isOpen,
                    contactIdToDelete: action.payload.contactId || null
                }
            };
        case 'UPDATE_CONTACT':
            return {
                ...state,
                contacts: state.contacts.map(contact =>
                    contact.id === action.payload.id
                        ? { ...contact, ...action.payload }
                        : contact
                )
            };
        case 'REMOVE_CONTACT':
            return {
                ...state,
                contacts: state.contacts.filter(contact => contact.id !== action.payload)
            };
        case 'ADD_CONTACT':
            return {
                ...state,
                contacts: [...state.contacts, action.payload]
            };
        case 'UPDATE_AVATAR':
            return {
                ...state,
                contacts: state.contacts.map(contact =>
                    contact.id === action.payload.id
                        ? { ...contact, avatar: action.payload.avatar }
                        : contact
                )
            };
        case 'UPDATE_AVATAR_FAILED':
            return state;
        default:
            return state;
    }
}