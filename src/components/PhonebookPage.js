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
    const totalContacts = useSelector(state => state.query.total);

    useEffect(() => {
        const checkAndLoadMoreContacts = () => {
            if (document.body.scrollHeight <= window.visualViewport.height) {
                dispatch(setQuery({ limit: limit + 1 }));
            }
        };

        const handleScroll = () => {
            if (window.visualViewport.height + document.documentElement.scrollTop === document.body.scrollHeight && limit <= totalContacts) {
                dispatch(setQuery({ limit: limit + 5 }));
            }
        };

        dispatch(loadContacts()).then(checkAndLoadMoreContacts);
        window.addEventListener('resize', checkAndLoadMoreContacts);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('touchmove', handleScroll);
        return () => {
            window.removeEventListener('resize', checkAndLoadMoreContacts);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('touchmove', handleScroll);
        };
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