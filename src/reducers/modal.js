const initialState = {
    deleteModal: {
        isOpen: false,
        contactId: null
    }
};

export default function modalReducer(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_DELETE_MODAL':
            return {
                ...state,
                deleteModal: {
                    isOpen: true,
                    contactId: action.contactId
                }
            };
        case 'HIDE_DELETE_MODAL':
            return {
                ...state,
                deleteModal: {
                    isOpen: false,
                    contactId: null
                }
            };
        default:
            return state;
    }
}
