import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { showDeleteModal } from "../actions/modal";
import React from "react";

export default function ContactItem({ id }) {
    const dispatch = useDispatch();
    const contact = useSelector(state =>
        state.contacts.find(contact => contact.id === id)
    );

    const handleDeleteClick = (e) => {
        e.preventDefault();
        dispatch(showDeleteModal({ id }));
    };

    return (
        <div className="contact-box col-s-3 col-2">
            <img className="avatar" src={contact.avatar ? "http://localhost:3000/images/" + contact.avatar : "/default-avatar.png"} alt="avatar" />
            <div className="contact-detail">
                <div className="contact-detail">{contact.name}</div>
                <div className="contact-detail">{contact.phone}</div>
                <div>
                    <button><FontAwesomeIcon icon={faEdit} /></button>
                    <button onClick={handleDeleteClick}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
            </div>
        </div>
    );
}

