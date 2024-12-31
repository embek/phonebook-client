import { faEdit, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function ContactItem({ contact, onShowDeleteModal, onUpdateContact }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: contact.name, phone: contact.phone });

    const handleEditClick = () => setIsEditing(true);

    const handleSaveClick = async () => {
        if (!editForm.name.trim() || !editForm.phone.trim()) {
            alert('Please fill in both name and phone');
            return;
        }

        try {
            await onUpdateContact(contact.id, editForm.name.trim(), editForm.phone.trim());
            setIsEditing(false);
        } catch (error) {
            alert('Failed to update contact: ' + error.message);
        }
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="contact-box col-s-3 col-2">
            <div>
                <img className="avatar" src={contact.avatar ? `http://192.168.1.20:3000/images/${contact.avatar}` : '/default-avatar.png'} alt={contact.avatar} />
            </div>
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
                        <>
                            <button onClick={handleSaveClick}><FontAwesomeIcon icon={faSave} /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleEditClick}><FontAwesomeIcon icon={faEdit} /></button>
                            <button onClick={() => onShowDeleteModal(contact.id)}><FontAwesomeIcon icon={faTrash} /></button>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}
