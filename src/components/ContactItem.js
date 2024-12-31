import { faEdit, faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef } from "react";

export default function ContactItem({ contact, onShowDeleteModal, onUpdateContact, onUpdateAvatar }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: contact.name, phone: contact.phone });
    const fileInputRef = useRef(null);

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

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            await onUpdateAvatar(contact.id, formData);
        } catch (error) {
            alert('Failed to update avatar: ' + error.message);
        }
    };

    return (
        <div className="contact-box col-s-3 col-2">
            <div>
                <img 
                    className="avatar" 
                    src={contact.avatar ? `http://192.168.1.20:3000/images/${contact.avatar}` : '/default-avatar.png'} 
                    alt={contact.avatar}
                    onClick={handleAvatarClick}
                    style={{ cursor: 'pointer' }}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                />
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
