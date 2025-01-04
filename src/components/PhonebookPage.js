import ContactList from "./ContactsList";
import DeleteModal from "./DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import { api } from "../api/contactsAPI";

export default function PhonebookPage() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [query, setQuery] = useState(JSON.parse(sessionStorage.getItem('query')) || {
        limit: 5,
        search: '',
        sortMode: 'ASC',
        sortBy: 'name'
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, contactIdToDelete: null });

    const filterAndSortContacts = (contactsList) => {
        return contactsList
            .filter(contact => {
                const searchTerm = query.search.toLowerCase();
                return contact.name.toLowerCase().includes(searchTerm) || 
                       contact.phone.includes(searchTerm);
            })
            .sort((a, b) => {
                const modifier = query.sortMode === 'ASC' ? 1 : -1;
                return modifier * a[query.sortBy].localeCompare(b[query.sortBy]);
            })
            .slice(0, query.limit);
    };

    const updateLocalContacts = (newContacts) => {
        sessionStorage.setItem('local_contacts', JSON.stringify(newContacts));
        setContacts(filterAndSortContacts(newContacts));
    };

    const loadContacts = async () => {
        try {
            const { data } = await api.get('api/phonebooks', { params: query });
            const offlineContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
            const pendingContacts = offlineContacts.filter(c => !c.status?.sent);
            
            const allContacts = [
                ...pendingContacts,
                ...data.phonebooks.map(contact => ({
                    ...contact,
                    status: { sent: true, operation: null }
                }))
            ];

            updateLocalContacts(allContacts);
        } catch (error) {
            console.error('Failed to load contacts:', error);
            const storedContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
            updateLocalContacts(storedContacts);
        }
    };

    const handleContactOperation = async (operation, id, contactData = null) => {
        try {
            switch (operation) {
                case 'delete':
                    await api.delete(`api/phonebooks/${id}`);
                    updateLocalContacts(contacts.filter(c => c.id !== id));
                    break;
                case 'update':
                    await api.put(`api/phonebooks/${id}`, contactData);
                    updateLocalContacts(contacts.map(c =>
                        c.id === id ? { ...c, ...contactData, status: { sent: true, operation: null } } : c
                    ));
                    break;
                case 'retry-add':
                    const { data } = await api.post('api/phonebooks', contactData);
                    updateLocalContacts(contacts.map(c =>
                        c.id === id ? { ...c, id: data.id, status: { sent: true, operation: null } } : c
                    ));
                    break;
            }
        } catch (error) {
            console.error(`Failed to ${operation} contact:`, error);
            if (operation !== 'retry-add') {
                updateLocalContacts(contacts.map(c =>
                    c.id === id ? { ...c, ...contactData, status: { sent: false, operation } } : c
                ));
            }
        }
    };

    useEffect(() => {
        sessionStorage.setItem('query', JSON.stringify(query));
        loadContacts();

        const sentinel = document.createElement('div');
        sentinel.style.height = '40px';
        document.body.appendChild(sentinel);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && contacts.length >= query.limit) {
                    setQuery(prev => ({ ...prev, limit: prev.limit + 5 }));
                }
            },
            { threshold: 0.7 }
        );

        observer.observe(sentinel);
        return () => {
            observer.disconnect();
            sentinel.remove();
        };
    }, [query]);

    return (
        <>
            <div className="topbar">
                <button
                    className="sort"
                    onClick={() => setQuery(prev => ({
                        ...prev,
                        sortMode: prev.sortMode === 'ASC' ? 'DESC' : 'ASC'
                    }))}
                >
                    <FontAwesomeIcon icon={query.sortMode === 'DESC' ? faArrowUpAZ : faArrowDownAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input
                    id="search"
                    type="text"
                    value={query.search}
                    onChange={e => setQuery(prev => ({ ...prev, search: e.target.value, limit: 5 }))}
                    placeholder="Search contacts..."
                />
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <ContactList
                contacts={contacts}
                updateContact={(id, name, phone) => handleContactOperation('update', id, { name, phone })}
                onShowDeleteModal={id => setDeleteModal({ isOpen: true, contactIdToDelete: id })}
                retryAdd={(contact) => handleContactOperation('retry-add', contact.id, contact)}
            />
            <DeleteModal
                contact={contacts.find(c => c.id === deleteModal.contactIdToDelete)}
                onConfirm={id => {
                    handleContactOperation('delete', id);
                    setDeleteModal({ isOpen: false, contactIdToDelete: null });
                }}
                onCancel={() => setDeleteModal({ isOpen: false, contactIdToDelete: null })}
            />
        </>
    );
}