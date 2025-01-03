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
    const [total, setTotal] = useState(0);
    const [query, setQuery] = useState(JSON.parse(sessionStorage.getItem('query')) || {
        limit: 5,
        search: '',
        sortMode: 'ASC',
        sortBy: 'name'
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        contactIdToDelete: null
    });

    const loadContacts = async () => {
        try {
            const { data } = await api.get('api/phonebooks', { params: query });
            setContacts(data.phonebooks);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        }
    };

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

    useEffect(() => {
        sessionStorage.setItem('query', JSON.stringify(query));
    }, [query]);

    useEffect(() => {
        loadContacts();

        const sentinel = document.createElement('div');
        sentinel.style.height = '40px';
        // sentinel.style.border = '1px solid black';
        document.body.appendChild(sentinel);

        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && query.limit <= total) {
                setQuery(prev => ({ ...prev, limit: prev.limit + 5 }));
            }
        }, {
            threshold: 0.7
        });

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
            sentinel.remove();
        };
    }, [query.limit, query.search, query.sortMode, query.sortBy, total]);

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
                    onChange={(e) => setQuery(prev => ({ ...prev, search: e.target.value, limit: 5 }))}
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