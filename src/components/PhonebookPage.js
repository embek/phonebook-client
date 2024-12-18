import ContactList from "../containers/ContactsList";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export default function PhonebookPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className="topbar">
                <button className="sort">
                    <FontAwesomeIcon icon={faArrowUpAZ} />
                </button>
                <input id="search" type="text"></input>
                <button className="add" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <div className="flex-container">
                <ContactList />
            </div>
        </>
    );
}