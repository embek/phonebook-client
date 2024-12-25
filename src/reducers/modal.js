const initialState = {
    isOpen: false,
    contactIdToDelete: null
};

export default function modalReducer(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_DELETE_MODAL':
            return {
                isOpen: true,
                contactIdToDelete: action.contactId
            };
        case 'HIDE_DELETE_MODAL':
            return {
                isOpen: false,
                contactIdToDelete: null
            };
        default:
            return state;
    }
}
