import { api } from "./api"

export const loadContacts = () => async (dispatch, getState) => {
    try {
        const query = getState().query;
        const { data } = await api.get('api/phonebooks', {
            params: query
        })
        dispatch({
            type: 'LOAD_CONTACTS',
            payload: data.phonebooks
        });
    } catch (error) {
        console.error(error);
        dispatch({
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
        dispatch(loadContacts());
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
        });
        dispatch(loadContacts());
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
        });
        dispatch(loadContacts());
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
        });
        dispatch(setEditMode(false, null));
        dispatch(loadContacts());
    } catch (error) {
        console.log(error)
    }
}

export const updateAvatar = (id, avatar) => async dispatch => {
    try {
        const formData = new FormData();
        formData.append('avatar', avatar);

        const { data } = await api.put(`api/phonebooks/${id}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        dispatch({
            type: 'UPDATE_AVATAR',
            id: data.id,
            avatar: data.avatar
        });
        dispatch(loadContacts());
    } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
            alert('Failed to upload avatar: Bad Request');
        }
        dispatch({
            type: 'UPDATE_AVATAR_FAILED'
        });
    }
};

export const toggleSort = () => (dispatch) => {
    dispatch({ type: 'TOGGLE_SORT_MODE' });
    dispatch(loadContacts());
};

export const setQuery = (queryParams) => (dispatch) => {
    dispatch({
        type: 'SET_QUERY',
        payload: queryParams
    });
    dispatch(loadContacts());
};

export const setEditMode = (isEdit, contactId, formData = null) => ({
    type: 'SET_EDIT_MODE',
    isEdit,
    contactId,
    formData
});

export const updateEditFormData = (fieldData) => async dispatch => {
    dispatch({
        type: 'UPDATE_EDIT_FORM_DATA',
        payload: fieldData
    });
    dispatch(loadContacts());
}