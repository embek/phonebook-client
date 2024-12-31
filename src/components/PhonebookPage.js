import ContactList from "./ContactsList";
import DeleteModal from "./DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import { api } from "../api/contactsAPI";

export default function PhonebookPage() {
    const [contacts, setContacts] = useState([]);
    const [total, setTotal] = useState(0);
    const [query, setQuery] = useState(JSON.parse(localStorage.getItem('query')) || {
        limit: 5,
        search: '',
        sortMode: 'ASC',
        sortBy: 'name'
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        contactIdToDelete: null
    });

    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('query', JSON.stringify(query));
    }, [query])

    const removeContact = async (id) => {
        try {
            await api.delete(`api/phonebooks/${id}`);
            loadContacts();
        } catch (error) {
            console.error(error);
        }
    };

    const updateContact = async (id, name, phone) => {
        try {
            await api.put(`api/phonebooks/${id}`, { name, phone });
            loadContacts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateAvatar = async (id, formData) => {
        try {
            await api.put(`api/phonebooks/${id}/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            loadContacts();
        } catch (error) {
            console.error(error);
        }
    };

    const loadContacts = async () => {
        try {
            const { data } = await api.get('api/phonebooks', {
                params: query
            });
            setContacts(data.phonebooks);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadContacts();
    }, [query.limit, query.search, query.sortMode, query.sortBy]);

    useEffect(() => {
        const checkAndLoadMoreContacts = () => {
            if (document.body.scrollHeight <= window.visualViewport.height && query.limit <= total) {
                setQuery(prev => ({ ...prev, limit: prev.limit + 3 }));
            }
        };

        const handleScroll = () => {
            if (window.visualViewport.height + document.documentElement.scrollTop === document.body.scrollHeight && query.limit <= total) {
                setQuery(prev => ({ ...prev, limit: prev.limit + 5 }));
            }
        };

        checkAndLoadMoreContacts();
        window.addEventListener('resize', checkAndLoadMoreContacts);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('touchmove', handleScroll);
        return () => {
            window.removeEventListener('resize', checkAndLoadMoreContacts);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('touchmove', handleScroll);
        };
    }, [query.limit, query.sortMode, query.sortBy, total, query.search]);

    return (
        <>
            <div className="topbar">
                <button className="sort" onClick={() =>
                    setQuery(prev => ({
                        ...prev,
                        sortMode: prev.sortMode === 'ASC' ? 'DESC' : 'ASC'
                    }))
                }>
                    <FontAwesomeIcon icon={query.sortMode === 'DESC' ? faArrowUpAZ : faArrowDownAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input
                    id="search"
                    type="text"
                    value={query.search}
                    onChange={(e) => setQuery(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search contacts..."
                />
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <ContactList
                contacts={contacts}
                updateContact={updateContact}
                onShowDeleteModal={(id) => setDeleteModal({ isOpen: true, contactIdToDelete: id })}
                onUpdateAvatar={handleUpdateAvatar}
            />
            <DeleteModal
                contact={contacts.find(c => c.id === deleteModal.contactIdToDelete)}
                onConfirm={(id) => {
                    removeContact(id);
                    setDeleteModal({ isOpen: false, contactIdToDelete: null });
                }}
                onCancel={() => setDeleteModal({ isOpen: false, contactIdToDelete: null })}
            />
        </>
    );
}