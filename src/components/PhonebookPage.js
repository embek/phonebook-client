import ContactList from "./ContactsList";
import DeleteModal from "./DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from "react";

export default function PhonebookPage({ 
    contacts, 
    query, 
    setQuery, 
    deleteModal, 
    setDeleteModal, 
    removeContact,
    updateContact 
}) {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAndLoadMoreContacts = () => {
            if (document.body.scrollHeight <= window.visualViewport.height) {
                setQuery(prev => ({ ...prev, limit: prev.limit + 1 }));
            }
        };

        const handleScroll = () => {
            if (window.visualViewport.height + document.documentElement.scrollTop === document.body.scrollHeight && query.limit <= query.total) {
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
    }, [query.limit, query.total, setQuery]);

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