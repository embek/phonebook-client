import { api } from '../services/api';

export const setModal = ({ dispatch, modal }) => dispatch({
    type: 'SET_MODAL',
    payload: modal
});

export const setQuery = ({ dispatch, query }) => dispatch({
    type: 'SET_QUERY',
    payload: query
});

export const loadContacts = async ({ dispatch, query }) => {
    const stored = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
    try {
        const { data } = await api.get('api/phonebooks', { params: query });
        const pending = stored.filter(c => !c.status?.sent);

        const remote = data.phonebooks
            .filter(server => !pending.find(local => local.id === server.id))
            .map(item => ({ ...item, status: { sent: true, operation: null } }));
        const merged = [...pending, ...remote];

        sessionStorage.setItem('local_contacts', JSON.stringify(merged));
        dispatch({ type: 'LOAD_CONTACTS_SUCCESS', payload: merged });
    } catch (error) {
        console.error('Failed to load contacts:', error.message);
        dispatch({ type: 'LOAD_CONTACTS_FAILED', payload: stored });
    }
};

export const handleContactOperation = async ({ dispatch, operation, id, contactData = null }) => {
    try {
        switch (operation) {
            case 'delete':
                await api.delete(`api/phonebooks/${id}`);
                dispatch({ type: 'DELETE_CONTACT', payload: id });
                break;

            case 'update':
                await api.put(`api/phonebooks/${id}`, contactData);
                dispatch({
                    type: 'UPDATE_CONTACT',
                    payload: {
                        id,
                        changes: contactData,
                        status: { sent: true, operation: null }
                    }
                });
                break;

            case 'retry-add':
                const { data } = await api.post('api/phonebooks', contactData);
                const stored = JSON.parse(sessionStorage.getItem('local_contacts'));
                sessionStorage.setItem('local_contacts', JSON.stringify(stored.filter(c => c.id !== id)));
                dispatch({
                    type: 'UPDATE_CONTACT',
                    payload: {
                        id,
                        changes: { ...contactData, id: data.id },
                        status: { sent: true, operation: null }
                    }
                });
                break;

            default:
                console.error(`Unknown operation: ${operation}`);
        }
    } catch (error) {
        console.error(`Failed to ${operation} contact:`, error);
        if (operation !== 'retry-add') {
            dispatch({
                type: 'UPDATE_CONTACT',
                payload: {
                    id,
                    changes: {},
                    status: { sent: false, operation }
                }
            });
        }
    }
};



