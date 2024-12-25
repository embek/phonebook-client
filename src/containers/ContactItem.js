import { faEdit, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { showDeleteModal } from "../actions/modal";
import { setEditMode, setEditFormData, updateContact, updateEditFormData } from "../actions/contacts";
import React from "react";

export default function ContactItem({ id }) {
    const dispatch = useDispatch();
    const contact = useSelector(state => 
        state?.contacts?.find(contact => contact.id === id)
    );
    const edit = useSelector(state => state.edit);
    const isEditing = edit.isEdit && edit.contactIdToEdit === id;

    const handleDeleteClick = (e) => {
        e.preventDefault();
        dispatch(showDeleteModal({ id }));
    };

    const handleEditClick = () => {
        dispatch(setEditMode(true, id));
        dispatch(setEditFormData({
            name: contact.name,
            phone: contact.phone
        }));
    };

    const handleSaveClick = () => {
        dispatch(updateContact(id, edit.formData.name, edit.formData.phone));
    };

    const handleInputChange = (field, value) => {
        dispatch(updateEditFormData({ [field]: value }));
    };

    return (
        <div className="contact-box col-s-3 col-2">
            <img className="avatar" src={contact.avatar ? "http://localhost:3000/images/" + contact.avatar : "/default-avatar.png"} alt="avatar" />
            <div className="contact-detail">
                {isEditing ? (
                    <>
                        <input
                            value={edit.formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="edit-input"
                        />
                        <input
                            value={edit.formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="edit-input"
                        />
                    </>
                ) : (
                    <>
                        <div>{contact.name}</div>
                        <div>{contact.phone}</div>
                    </>
                )}
                <div>
                    {isEditing ? (
                        <button onClick={handleSaveClick}><FontAwesomeIcon icon={faSave} /></button>
                    ) : (
                        <>
                            <button onClick={handleEditClick}><FontAwesomeIcon icon={faEdit} /></button>
                            <button onClick={handleDeleteClick}><FontAwesomeIcon icon={faTrash} /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

