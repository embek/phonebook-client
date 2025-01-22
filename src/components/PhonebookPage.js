import ContactItem from "./ContactItem";
import DeleteModal from "./DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useContext, useEffect, useState } from "react";
import { CustomContext } from "./CustomContext";
import { loadContacts, setQuery } from "../actions/contacts";

export default function PhonebookPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useContext(CustomContext);
    // const [contacts, setContacts] = useState([]);
    // const [query, setQuery] = useState(JSON.parse(sessionStorage.getItem('query')) || {
    //     limit: 5,
    //     search: '',
    //     sortMode: 'ASC',
    //     sortBy: 'name'
    // });
    // const [deleteModal, setDeleteModal] = useState({ isOpen: false, contactIdToDelete: null });

    // const filterAndSortContacts = (contactsList) => {
    //     const searchTerm = query.search.toLowerCase();
    //     const modifier = query.sortMode === 'ASC' ? 1 : -1;

    //     return contactsList
    //         .filter(contact =>
    //             contact.name.toLowerCase().includes(searchTerm) ||
    //             contact.phone.includes(searchTerm)
    //         )
    //         .sort((a, b) => modifier * a[query.sortBy].localeCompare(b[query.sortBy]))
    //         .slice(0, query.limit);
    // };

    // const updateLocalContacts = (newContacts) => {
    //     sessionStorage.setItem('local_contacts', JSON.stringify(newContacts));
    //     setContacts(filterAndSortContacts(newContacts));
    // };

    // const loadContacts = async () => {
    //     try {
    //         const { data } = await api.get('api/phonebooks', { params: query });
    //         const localContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
    //         const pendingContacts = localContacts.filter(c => !c.status?.sent);

    //         const serverContacts = data.phonebooks
    //             .filter(server => !pendingContacts.find(local => local.id === server.id))
    //             .map(contact => ({ ...contact, status: { sent: true, operation: null } }));

    //         updateLocalContacts([...pendingContacts, ...serverContacts]);
    //     } catch (error) {
    //         console.error('Failed to load contacts:', error);
    //         updateLocalContacts(JSON.parse(sessionStorage.getItem('local_contacts') || '[]'));
    //     }
    // };

    // const handleContactOperation = async (operation, id, contactData = null) => {
    //     const updateContactStatus = (success, newData = null) => {
    //         const status = success ? { sent: true, operation: null } : { sent: false, operation };
    //         updateLocalContacts(contacts.map(c =>
    //             c.id === id ? { ...c, ...(newData || contactData), status } : c
    //         ));
    //     };

    //     try {
    //         switch (operation) {
    //             case 'delete':
    //                 await api.delete(`api/phonebooks/${id}`);
    //                 updateLocalContacts(contacts.filter(c => c.id !== id));
    //                 break;
    //             case 'update':
    //                 await api.put(`api/phonebooks/${id}`, contactData);
    //                 updateContactStatus(true);
    //                 break;
    //             case 'retry-add':
    //                 const { data } = await api.post('api/phonebooks', contactData);
    //                 updateContactStatus(true, { id: data.id });
    //                 break;
    //             default:
    //                 console.error(`Unknown operation: ${operation}`);
    //         }
    //     } catch (error) {
    //         console.error(`Failed to ${operation} contact:`, error);
    //         if (operation !== 'retry-add') updateContactStatus(false);
    //     }
    // };

    useEffect(() => {
        sessionStorage.setItem('query', JSON.stringify(query));
        loadContacts();

        const sentinel = document.createElement('div');
        sentinel.style.height = '40px';
        document.body.appendChild(sentinel);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && contacts.length >= query.limit) {
                    setQuery({ ...state.query, limit: prev.limit + 5 });
                }
            },
            { threshold: 0.7 }
        );

        observer.observe(sentinel);
        return () => {
            observer.disconnect();
            sentinel.remove();
        };
    }, [query, contacts.length]);

    return (
        <>
            <div className="topbar">
                <button
                    className="sort"
                    onClick={() => setQuery({
                        ...state.query,
                        sortMode: prev.sortMode === 'ASC' ? 'DESC' : 'ASC'
                    })}
                >
                    <FontAwesomeIcon icon={query.sortMode === 'DESC' ? faArrowDownAZ : faArrowUpAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input
                    id="search"
                    type="text"
                    value={query.search}
                    onChange={e => setQuery({ ...state.query, search: e.target.value, limit: 5 })}
                    placeholder="Search contacts..."
                />
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <div className="contacts-list" data-testid="contacts-list">
                {contacts.map(contact => (
                    <ContactItem key={contact.id} contact={contact} />
                ))}
            </div>
            <DeleteModal
                contact={contacts.find(c => c.id === state.modal.contactIdToDelete)}
            />
        </>
    );
}