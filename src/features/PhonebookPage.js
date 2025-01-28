import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import ContactItem from "./ContactItem";
import DeleteModal from "./DeleteModal";
import { loadContacts, setQuery } from "./phonebookSlice";

export default function PhonebookPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { contacts, query } = useSelector(state => state.phonebook);

    useEffect(() => {
        sessionStorage.setItem('query', JSON.stringify(query) || '{}');
        dispatch(loadContacts(query));

        const sentinel = document.createElement('div');
        sentinel.style.height = '40px';
        document.body.appendChild(sentinel);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && contacts.length >= query.limit) {
                    dispatch(setQuery({ ...query, limit: query.limit + 5 }));
                }
            },
            { threshold: 0.7 }
        );

        observer.observe(sentinel);
        return () => {
            observer.disconnect();
            sentinel.remove();
        };
    }, [query, contacts.length, dispatch]);

    return (
        <>
            <div className="topbar">
                <button
                    className="sort"
                    onClick={() => dispatch(setQuery({
                        ...query,
                        limit: 5,
                        sortMode: query.sortMode === 'ASC' ? 'DESC' : 'ASC'
                    }))}
                >
                    <FontAwesomeIcon icon={query.sortMode === 'DESC' ? faArrowDownAZ : faArrowUpAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input
                    id="search"
                    type="text"
                    value={query.search}
                    onChange={e => dispatch(setQuery({
                        ...query,
                        search: e.target.value,
                        limit: 5
                    }))}
                    placeholder="Search contacts..."
                />
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <div className="contacts-list" >
                {contacts.map(contact => (
                    <ContactItem key={contact.id} contact={contact} />
                ))}
            </div>
            <DeleteModal />
        </>
    );
}