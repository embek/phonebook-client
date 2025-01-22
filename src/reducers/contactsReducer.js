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

export function contactsReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_CONTACTS':
            return { ...state, contacts: action.payload };
        case 'SET_MODAL':
            return { ...state, modal: action.payload };
        case 'SET_QUERY':
            return { ...state, query: action.payload };
        default:
            return state;
    }
}