import ContactList from "../containers/ContactsList";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export default function PhonebookPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className="topbar row">
                <button className="col-auto">
                    <FontAwesomeIcon icon={faArrowUpAZ} />
                </button>
                <input type="text" className="col custom-input"></input>
                <button className="col-auto" onClick={() => navigate('/add')}>
                    <FontAwesomeIcon icon={faUserPlus} />
                </button>
            </div>
            <ContactList />
        </>
    );
}