import ContactItem from "./ContactItem";
import DeleteModal from "./DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useContext, useEffect } from "react";
import { CustomContext } from "./CustomContext";
import { loadContacts, setQuery } from "../actions/contacts";

export default function PhonebookPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useContext(CustomContext);

    useEffect(() => {
        sessionStorage.setItem('query', JSON.stringify(state.query) || '{}');
        loadContacts({ dispatch, query: state.query });

        const sentinel = document.createElement('div');
        sentinel.style.height = '40px';
        document.body.appendChild(sentinel);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && state.contacts.length >= state.query.limit) {
                    setQuery({ dispatch, query: { ...state.query, limit: state.query.limit + 5 } });
                }
            },
            { threshold: 0.7 }
        );

        observer.observe(sentinel);
        return () => {
            observer.disconnect();
            sentinel.remove();
        };
    }, [state.query, state.contacts.length]);

    return (
        <>
            <div className="topbar">
                <button
                    className="sort"
                    onClick={() => setQuery({
                        dispatch,
                        query: {
                            ...state.query,
                            limit: 5,
                            sortMode: state.query.sortMode === 'ASC' ? 'DESC' : 'ASC'
                        }
                    })}
                >
                    <FontAwesomeIcon icon={state.query.sortMode === 'DESC' ? faArrowDownAZ : faArrowUpAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input
                    id="search"
                    type="text"
                    value={state.query.search}
                    onChange={e => setQuery({
                        dispatch,
                        query: {
                            ...state.query,
                            search: e.target.value,
                            limit: 5
                        }
                    })}
                    placeholder="Search contacts..."
                />
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <div className="contacts-list" >
                {state.contacts.map(contact => (
                    <ContactItem key={contact.id} contact={contact} />
                ))}
            </div>
            <DeleteModal
                contact={state.contacts.find(c => c.id === state.modal.contactIdToDelete)}
            />
        </>
    );
}