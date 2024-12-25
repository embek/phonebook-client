import ContactList from "../containers/ContactsList";
import DeleteModal from "../containers/DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { loadContacts, toggleSort } from "../actions/contacts";

export default function PhonebookPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const sortMode = useSelector(state => state.query.sortMode);

    useEffect(() => {
        dispatch(loadContacts());
    }, [dispatch]);

    return (
        <>
            <div className="topbar">
                <button className="sort" onClick={() => dispatch(toggleSort())}>
                    <FontAwesomeIcon icon={sortMode === 'DESC' ? faArrowUpAZ : faArrowDownAZ} />
                </button>
                <i className="mag-glass"><FontAwesomeIcon icon={faSearch} /></i>
                <input id="search" type="text"></input>
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <ContactList />
            <DeleteModal />
        </>
    );
}