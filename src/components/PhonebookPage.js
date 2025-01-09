import DeleteModal from "./DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from "react";
import { useCustomContext } from './CustomContext';
import ContactItem from './ContactItem';
import { loadContacts, setQuery } from '../actions/contacts';

export default function PhonebookPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useCustomContext();
    const { contacts, query } = state;

    useEffect(() => {
        loadContacts(dispatch, state);
    }, [query, dispatch]);

    return (
        <>
            <div className="topbar">
                <button
                    className="sort"
                    onClick={() => setQuery(dispatch, { sortMode: query.sortMode === 'ASC' ? 'DESC' : 'ASC' })}
                >
                    <FontAwesomeIcon icon={query.sortMode === 'DESC' ? faArrowDownAZ : faArrowUpAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input
                    id="search"
                    type="text"
                    value={query.search}
                    onChange={e => setQuery(dispatch, { search: e.target.value, limit: 5 })}
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
            <DeleteModal />
        </>
    );
}