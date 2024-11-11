import { api } from "./api"

export const loadContacts = (query) => async (dispatch, getState) => {
    try {
        const { data } = await api.get('api/phonebooks', {
            params: {
                query
            }
        })

        dispatch({ type: 'LOAD_CONTACTS', contacts: data.phonebooks })
    } catch (error) {
        console.log(error)
        dispatch({ type: 'LOAD_CONTACTS_FAILED', contacts: getState().contacts })
    }
}

export const addContact = (name, phone) => async dispatch => {
    const id = Date.now().toString()
    try {
        dispatch({
            type: 'ADD_CONTACT_REQUEST',
            id,
            name,
            phone
        })
        const data = await api.post('api/phonebooks', {
            name,
            phone
        })
        dispatch({
            type: 'ADD_CONTACT_SUCCESS',
            oldId: id,
            newId: data.id
        })
    } catch (error) {
        console.log(error)
        dispatch({
            type: 'ADD_CONTACT_FAILED',
            id
        })
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
        const data  = await api.put(`api/phonebooks/${id}`, {
            name,
            phone
        })
        dispatch({
            type: 'UPDATE_CONTACT',
            id: data.id,
            name,
            phone
        })
    } catch (error) {
        console.log(error)
        dispatch({
            type: 'UPDATE_CONTACT_FAILED'
        })
    }
}

export const updateAvatar = (id, avatar) => async dispatch => {
    try {
        const data  = await api.put(`api/phonebooks/${id}/avatar`, {
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