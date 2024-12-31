import { faEdit, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function ContactItem({ contact, onShowDeleteModal, onUpdateContact }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: contact.name, phone: contact.phone });

    const handleEditClick = () => setIsEditing(true);

    const handleSaveClick = () => {
        onUpdateContact(contact.id, editForm.name, editForm.phone);
        setIsEditing(false);
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="contact-box col-s-3 col-2">
            {/* ...existing avatar code... */}
            <div className="contact-detail">
                {isEditing ? (
                    <>
                        <input
                            value={editForm.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="edit-input"
                        />
                        <input
                            value={editForm.phone}
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
                            <button onClick={() => onShowDeleteModal(contact.id)}><FontAwesomeIcon icon={faTrash} /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
