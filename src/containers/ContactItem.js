import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function ContactItem() {

    return (
        <div className="contact-box col-s-4 col-2">
            <img className="avatar" src="/default-avatar.png" alt="avatar"/>
            <div className="contact-detail">
                <div className="contact-detail">name</div>
                <div className="contact-detail">phone</div>
                <div>
                    <button><FontAwesomeIcon icon={faEdit} /></button>
                    <button><FontAwesomeIcon icon={faTrash} /></button>
                </div>
            </div>
        </div>
    );
}

