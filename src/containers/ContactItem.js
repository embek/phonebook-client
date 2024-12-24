import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { removeContact } from "../actions/contacts";
import React from "react";

export default function ContactItem({ id }) {
    const dispatch = useDispatch();
    const contact = useSelector(state => 
        state.contacts.find(contact => contact.id === id)
    );

    const handleDelete = () => {
        dispatch(removeContact(id));
    };

    return (
        <div className="contact-box col-s-4 col-2">
            <img className="avatar" src={contact.avatar || "/default-avatar.png"} alt="avatar"/>
            <div className="contact-detail">
                <div className="contact-detail">{contact.name}</div>
                <div className="contact-detail">{contact.phone}</div>
                <div>
                    <button><FontAwesomeIcon icon={faEdit} /></button>
                    <button onClick={handleDelete}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
            </div>
        </div>
    );
}

