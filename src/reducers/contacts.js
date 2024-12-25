const initialState = [];

export default function contactsReducer(state = initialState, action) {
    switch (action.type) {
        case 'LOAD_CONTACTS':
            return action.payload;
            
        case 'ADD_CONTACT_SUCCESS':
            return [...state, action.payload];
            
        case 'REMOVE_CONTACT':
            return state.filter(contact => contact.id !== action.id);
            
        case 'UPDATE_CONTACT':
            return state.map(contact => 
                contact.id === action.id 
                    ? { ...contact, name: action.name, phone: action.phone }
                    : contact
            );
            
        case 'UPDATE_AVATAR':
            return state.map(contact =>
                contact.id === action.id
                    ? { ...contact, avatar: action.avatar }
                    : contact
            );
            
        default:
            return state;
    }
}