import { api } from '../services/api';
import { initialState } from '../reducers/contactsReducer';

export const filterAndSortContacts = (state, contactsList) => {
    const searchTerm = state.query.search.toLowerCase();
    const modifier = state.query.sortMode === 'ASC' ? 1 : -1;

    const sortedContacts = contactsList.sort((a, b) => {
        if ((!a.status?.sent) && b.status?.sent) return -1;
        if (a.status?.sent && (!b.status?.sent)) return 1;
        return modifier * a[state.query.sortBy].localeCompare(b[state.query.sortBy]);
    });

    return sortedContacts
        .filter(contact =>
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.phone.includes(searchTerm)
        )
        .slice(0, state.query.limit);
};

export const updateLocalContacts = (dispatch, state, newContacts) => {
    // console.log('Updating local contacts:', newContacts);
    sessionStorage.setItem('local_contacts', JSON.stringify(newContacts) || '[]');
    setContacts(dispatch, filterAndSortContacts(state, newContacts));
};

export const loadContacts = async (dispatch, state = initialState) => {
    try {
        const { data } = await api.get('api/phonebooks', { params: state.query });
        const localContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
        const pendingContacts = localContacts.filter(c => !c.status?.sent);

        const serverContacts = data.phonebooks
            .filter(server => !pendingContacts.find(local => local.id === server.id))
            .map(contact => ({ ...contact, status: { sent: true, operation: null } }));
        // console.log('Server contacts:', serverContacts);
        sessionStorage.setItem('local_contacts', JSON.stringify([...pendingContacts, ...serverContacts] || '[]'));
        setContacts(dispatch, [...pendingContacts, ...serverContacts])
    } catch (error) {
        console.error('Failed to load contacts:', error.message);
        updateLocalContacts(dispatch, state, JSON.parse(sessionStorage.getItem('local_contacts') || '[]'));
    }
};

export const handleContactOperation = async (dispatch, state, operation, id, contactData = null) => {
    const updateContactStatus = (success, newData = null) => {
        const status = success ? { sent: true, operation: null } : { sent: false, operation };
        const updatedContacts = state.contacts.map(c =>
            c.id === id ? { ...c, ...(newData || contactData), status } : c
        );
        updateLocalContacts(dispatch, state, updatedContacts);
    };

    try {
        switch (operation) {
            case 'delete':
                await api.delete(`api/phonebooks/${id}`);
                updateLocalContacts(dispatch, state, state.contacts.filter(c => c.id !== id));
                break;
            case 'update':
                await api.put(`api/phonebooks/${id}`, contactData);
                updateContactStatus(true);
                break;
            case 'retry-add':
                const { data } = await api.post('api/phonebooks', contactData);
                updateContactStatus(true, { id: data.id });
                break;
            default:
                console.error(`Unknown operation: ${operation}`);
        }
    } catch (error) {
        console.error(`Failed to ${operation} contact:`, error);
        if (operation !== 'retry-add') updateContactStatus(false);
    }
};

export const setContacts = (dispatch, newContacts) => dispatch({
    type: 'SET_CONTACTS',
    payload: newContacts
});

export const setModal = (dispatch, newModal) => dispatch({
    type: 'SET_MODAL',
    payload: newModal
});

export const setQuery = (dispatch, newQuery) => dispatch({
    type: 'SET_QUERY',
    payload: newQuery
});



