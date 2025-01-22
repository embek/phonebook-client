import { api } from '../services/api';

export const filterAndSortContacts = (contactsList) => {
    const searchTerm = query.search.toLowerCase();
    const modifier = query.sortMode === 'ASC' ? 1 : -1;

    return contactsList
        .filter(contact =>
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.phone.includes(searchTerm)
        )
        .sort((a, b) => modifier * a[query.sortBy].localeCompare(b[query.sortBy]))
        .slice(0, query.limit);
};

export const updateLocalContacts = (newContacts) => {
    sessionStorage.setItem('local_contacts', JSON.stringify(newContacts));
    setContacts(filterAndSortContacts(newContacts));
};

export const loadContacts = async () => {
    try {
        const { data } = await api.get('api/phonebooks', { params: query });
        const localContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
        const pendingContacts = localContacts.filter(c => !c.status?.sent);

        const serverContacts = data.phonebooks
            .filter(server => !pendingContacts.find(local => local.id === server.id))
            .map(contact => ({ ...contact, status: { sent: true, operation: null } }));

        updateLocalContacts([...pendingContacts, ...serverContacts]);
    } catch (error) {
        console.error('Failed to load contacts:', error);
        updateLocalContacts(JSON.parse(sessionStorage.getItem('local_contacts') || '[]'));
    }
};

export const handleContactOperation = async (operation, id, contactData = null) => {
    const updateContactStatus = (success, newData = null) => {
        const status = success ? { sent: true, operation: null } : { sent: false, operation };
        updateLocalContacts(contacts.map(c =>
            c.id === id ? { ...c, ...(newData || contactData), status } : c
        ));
    };

    try {
        switch (operation) {
            case 'delete':
                await api.delete(`api/phonebooks/${id}`);
                updateLocalContacts(contacts.filter(c => c.id !== id));
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

export const setContacts = (newContacts) => {
    dispatch({ type: 'SET_CONTACTS', payload: newContacts });
}

export const setModal = (newModal) => {
    dispatch({ type: 'SET_MODAL', payload: newModal });
}

export const setQuery = (newQuery) => {
    dispatch({ type: 'SET_QUERY', payload: newQuery });
}



