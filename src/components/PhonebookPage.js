import ContactList from "../containers/ContactsList";
import DeleteModal from "../containers/DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { loadContacts, toggleSort, setQuery } from "../actions/contacts";

export default function PhonebookPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const sortMode = useSelector(state => state.query.sortMode);
    const searchQuery = useSelector(state => state.query.search);
    const limit = useSelector(state => state.query.limit);
    const totalContacts = useSelector(state => state.contacts.length); 

    useEffect(() => {
        dispatch(loadContacts());
    }, [dispatch]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
                if (limit < totalContacts) { 
                    dispatch(setQuery({ limit: limit + 5 }));
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [dispatch, limit, totalContacts]);

    const handleSearchChange = (e) => {
        dispatch(setQuery({ search: e.target.value }));
    };

    return (
        <>
            <div className="topbar">
                <button className="sort" onClick={() => dispatch(toggleSort())}>
                    <FontAwesomeIcon icon={sortMode === 'DESC' ? faArrowUpAZ : faArrowDownAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search contacts..."
                ></input>
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <ContactList />
            <DeleteModal />
        </>
    );
}