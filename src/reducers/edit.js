const initialState = {
    isEdit: false,
    contactIdToEdit: null,
    formData: {
        name: '',
        phone: ''
    }
};

export default function editReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_EDIT_MODE':
            return {
                ...state,
                isEdit: action.isEdit,
                contactIdToEdit: action.contactId,
                formData: action.formData || state.formData
            };
        case 'UPDATE_EDIT_FORM_DATA':
            return {
                ...state,
                formData: {
                    ...state.formData,
                    ...action.payload
                }
            };
        default:
            return state;
    }
}
