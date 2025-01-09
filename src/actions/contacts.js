import { api } from "../api/contactsAPI";

export const loadContacts = async (dispatch, state) => {
    try {
        const query = state.query;
        const { data } = await api.get('api/phonebooks', { params: query });
        dispatch({ type: 'RESET_TOTAL', payload: data.total });
        dispatch({ type: 'LOAD_CONTACTS', payload: data.phonebooks.map(c => ({ ...c, status: { sent: true, operation: null } })) });
    } catch (error) {
        console.error(error);
        dispatch({ type: 'LOAD_CONTACTS_FAILED', payload: state.contacts });
    }
};

export const addContact = async (dispatch, name, phone) => {
    const id = Date.now().toString();
    try {
        dispatch({ type: 'ADD_CONTACT', payload: { id, name, phone } });
        const { data } = await api.post('api/phonebooks', { name, phone });
        dispatch({ type: 'ADD_CONTACT_SUCCESS', oldId: id, newId: data.id });
        loadContacts(dispatch);
    } catch (error) {
        console.error(error);
        dispatch({ type: 'ADD_CONTACT_FAILED', id });
    }
};

export const resendContact = async (dispatch, { id, name, phone }) => {
    try {
        const data = await api.post('api/phonebooks', { name, phone });
        dispatch({ type: 'RESEND_CONTACT', oldId: id, newId: data.id });
        loadContacts(dispatch);
    } catch (error) {
        console.log('gagal resend');
    }
};

export const removeContact = async (dispatch, id) => {
    try {
        const { data } = await api.delete(`api/phonebooks/${id}`);
        dispatch({ type: 'REMOVE_CONTACT', payload: { id: data.id } });
        loadContacts(dispatch);
    } catch (error) {
        console.log(error);
        alert('gagal hapus data');
    }
};

export const updateContact = async (dispatch, id, name, phone) => {
    try {
        const { data } = await api.put(`api/phonebooks/${id}`, { name, phone });
        dispatch({ type: 'UPDATE_CONTACT', payload: { id: data.id, name, phone } });
        dispatch({ type: 'SET_EDIT_MODE', payload: { isEdit: false, contactId: null, formData: null } });
        loadContacts(dispatch);
    } catch (error) {
        console.log(error);
    }
};

export const updateAvatar = async (dispatch, id, avatar) => {
    try {
        const formData = new FormData();
        formData.append('avatar', avatar);

        const { data } = await api.put(`api/phonebooks/${id}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        dispatch({ type: 'UPDATE_AVATAR', payload: { id: data.id, avatar: data.avatar } });
        loadContacts(dispatch);
    } catch (error) {
        console.log(error);
        alert('Failed to upload avatar');
        dispatch({ type: 'UPDATE_AVATAR_FAILED' });
    }
};

export const toggleSort = (dispatch) => {
    dispatch({ type: 'TOGGLE_SORT_MODE' });
    loadContacts(dispatch);
};

export const setQuery = (dispatch, queryParams) => {
    dispatch({ type: 'RESET_LIMIT', payload: 10 });
    dispatch({ type: 'SET_QUERY', payload: queryParams });
    loadContacts(dispatch);
};
