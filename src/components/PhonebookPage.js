import ContactList from "../containers/ContactsList";
import DeleteModal from "../containers/DeleteModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { loadContacts } from "../actions/contacts";

export default function PhonebookPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadContacts());
    }, [dispatch]);

    return (
        <>
            <div className="topbar">
                <button className="sort">
                    <FontAwesomeIcon icon={faArrowUpAZ} />
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