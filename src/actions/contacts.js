import { api } from "./api"

export const loadContacts = (queryParams) => async (dispatch, getState) => {
    try {
        const currentQuery = getState().query;
        const query = { ...currentQuery, ...queryParams };
        const { data } = await api.get('api/phonebooks', {
            params: query
        })
        return dispatch({
            type: 'LOAD_CONTACTS',
            payload: data.phonebooks
        });
    } catch (error) {
        console.error(error);
        return dispatch({
            type: 'LOAD_CONTACTS_FAILED',
            payload: getState().contacts
        });
    }
}

export const addContact = (name, phone) => async dispatch => {
    try {
        const { data } = await api.post('api/phonebooks', {
            name,
            phone
        });

        dispatch({
            type: 'ADD_CONTACT_SUCCESS',
            payload: {
                id: data.id,
                name,
                phone
            }
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'ADD_CONTACT_FAILED'
        });
    }
}

export const resendContact = ({ id, name, phone }) => async dispatch => {
    try {
        const data = await api.post('api/phonebooks', {
            name,
            phone
        })
        dispatch({
            type: 'RESEND_CONTACT',
            oldId: id,
            newId: data.id
        })
    } catch (error) {
        console.log('gagal resend')
    }
}

export const removeContact = (id) => async dispatch => {
    try {
        const { data } = await api.delete(`api/phonebooks/${id}`)
        dispatch({
            type: 'REMOVE_CONTACT',
            id: data.id
        })
    } catch (error) {
        console.log(error)
        alert('gagal hapus data')
    }
}

export const updateContact = (id, name, phone) => async dispatch => {
    try {
        const { data } = await api.put(`api/phonebooks/${id}`, {
            name,
            phone
        })
        dispatch({
            type: 'UPDATE_CONTACT',
            id: data.id,
            name,
            phone
        })
        // Automatically exit edit mode after successful update
        dispatch(setEditMode(false, null));
    } catch (error) {
        console.log(error)
    }
}

export const updateAvatar = (id, avatar) => async dispatch => {
    try {
        const { data } = await api.put(`api/phonebooks/${id}/avatar`, {
            avatar
        })
        dispatch({
            type: 'UPDATE_AVATAR',
            id: data.id,
            avatar
        })
    } catch (error) {
        console.log(error)
        dispatch({
            type: 'UPDATE_AVATAR_FAILED'
        })
    }
}

export const toggleSort = () => (dispatch) => {
    dispatch({ type: 'TOGGLE_SORT_MODE' });
    dispatch(loadContacts());
};

export const setQuery = (queryParams) => (dispatch) => {
    dispatch({
        type: 'SET_QUERY',
        payload: queryParams
    });
    dispatch(loadContacts(queryParams));
};

export const setEditMode = (isEdit, contactId) => ({
    type: 'SET_EDIT_MODE',
    isEdit,
    contactId
});

export const setEditFormData = (formData) => ({
    type: 'SET_EDIT_FORM_DATA',
    payload: formData
});

export const updateEditFormData = (fieldData) => ({
    type: 'UPDATE_EDIT_FORM_DATA',
    payload: fieldData
});