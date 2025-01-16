import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useContext, useEffect } from "react";
import { CustomContext } from "./CustomContext";
import { updateContact, removeContact, resendContact, loadContacts } from '../actions/contacts';
import ContactItem from "./ContactItem";
import DeleteModal from "./DeleteModal";

export default function PhonebookPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useContext(CustomContext);
    const { contacts, modal, query } = state;

    const handleQueryUpdate = (updates) => {
        dispatch({ type: 'SET_QUERY', payload: updates });
    };

    const handleModal = (isOpen, contactId = null) => {
        dispatch({
            type: 'TOGGLE_MODAL',
            payload: { isOpen, contactId }
        });
    };

    useEffect(() => {
        sessionStorage.setItem('query', JSON.stringify(query));
        loadContacts(dispatch, state);

        const sentinel = document.createElement('div');
        sentinel.id = 'scroll-sentinel';
        document.body.appendChild(sentinel);

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && contacts.length >= query.limit) {
                handleQueryUpdate({ limit: query.limit + 5 });
            }
        });

        observer.observe(sentinel);
        return () => {
            observer.disconnect();
            sentinel.remove();
        };
    }, [query, contacts.length]);

    return (
        <>
            <div className="topbar">
                <button className="sort"
                    onClick={() => handleQueryUpdate({ sortMode: query.sortMode === 'ASC' ? 'DESC' : 'ASC' })}>
                    <FontAwesomeIcon icon={query.sortMode === 'DESC' ? faArrowDownAZ : faArrowUpAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input
                    id="search"
                    type="text"
                    value={query.search}
                    onChange={e => handleQueryUpdate({ search: e.target.value, limit: 5 })}
                    placeholder="Search contacts..."
                />
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <div className="contacts-list">
                {
                    contacts.map(contact => (
                        <ContactItem
                            key={contact.id}
                            contact={contact}
                            onEdit={() => navigate(`/edit/${contact.id}`)}
                            onDelete={() => handleModal(true, contact.id)}
                        />
                    ))
                }
            </div>
            <DeleteModal
                contact={contacts.find(c => c.id === modal.contactIdToDelete)}
                onConfirm={async id => {
                    await removeContact(dispatch, id);
                    handleModal(false);
                }}
                onCancel={() => handleModal(false)}
            />
        </>
    );
}