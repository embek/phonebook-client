export default function contactsReducer(state = [], action) {
    switch (action.type) {
        case 'LOAD_CONTACTS':
            return action.contacts.map(item => {
                item.sent = true;
                return item;
            })

        case 'ADD_CONTACT_REQUEST':
            return [
                {
                    id: action.id,
                    name: action.name,
                    phone: action.phone,
                    avatar: action.avatar,
                    sent: true
                },
                ...state
            ]

        case 'ADD_CONTACT_SUCCESS':
            return state.map(contact => {
                if (contact.id === action.oldId) {
                    contact.id = action.newId;
                }
                return contact;
            })

        case 'ADD_CONTACT_FAILED':
            return state.map(contact => {
                if (contact.id === action.id) {
                    contact.sent = false;
                }
                return contact;
            })

        case 'RESEND_CONTACT':
            return state.map(contact => {
                if (contact.id === action.oldId) {
                    contact.id = action.newId;
                    contact.sent = true;
                }
                return contact;
            })

        case 'REMOVE_CONTACT':
            return state.filter(contact => contact.id !== action.id)
        case 'UPDATE_CONTACT':
            return state.map(contact => {
                if (contact.id === action.id) {
                    contact.name = action.name;
                    contact.phone = action.phone;
                }
                return contact;
            })

        case 'UPDATE_AVATAR':
            return state.map(contact => {
                if (contact.id === action.id) {
                    contact.avatar = action.avatar;
                }
                return contact;
            })
        case 'LOAD_CONTACTS_FAILED':
        case 'UPDATE_CONTACT_FAILED':
        case 'UPDATE_AVATAR_FAILED':
        default:
            return state;
    }
}