import { faEdit, faTrash, faSave, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { handleContactOperation, setModal } from "../actions/contacts";
import { CustomContext } from "./CustomContext";

export default function ContactItem({ contact }) {
    const navigate = useNavigate();
    const { dispatch } = useContext(CustomContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: contact.name, phone: contact.phone });

    const handleSaveClick = async () => {
        const name = editForm.name.trim();
        const phone = editForm.phone.trim();
        if (!name || !phone) {
            alert('Please fill in both name and phone');
            return;
        }

        if (!/^\d+$/.test(phone)) {
            alert('Phone number must contain only numeric characters');
            return;
        }

        try {
            await handleContactOperation({
                dispatch,
                operation: 'update',
                id: contact.id,
                contactData: { name, phone }
            });
            setIsEditing(false);
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarClick = () => {
        const avatarPath = contact.avatar ? `${process.env.REACT_APP_API_URL}/images/${contact.avatar}` : `${process.env.REACT_APP_BASE_URL}/default-avatar.png`;
        sessionStorage.setItem('currentAvatar', avatarPath);
        navigate(`/avatar/${contact.id}`);
    };

    const getStatusMessage = () => {
        if (!contact.status?.sent) {
            switch (contact.status?.operation) {
                case 'add': return '(Failed to add)';
                case 'update': return '(Failed to update)';
                case 'delete': return '(Failed to delete)';
                default: return '(Failed to sync)';
            }
        }
        return '';
    };

    const handleEdit = () => {
        setIsEditing(true);
    }

    const handleDelete = () => {
        setModal({
            dispatch,
            modal: { isOpen: true, contactIdToDelete: contact.id }
        });
    }

    const handleRetry = async () => {
        switch (contact.status?.operation) {
            case 'update':
                await handleSaveClick();
                break;
            case 'delete':
                await handleDelete();
                break;
            case 'add':
                await handleContactOperation({
                    dispatch,
                    operation: 'retry-add',
                    id: contact.id,
                    contactData: contact
                });
                break;
            default:
                if (editForm.name !== contact.name || editForm.phone !== contact.phone) {
                    await handleSaveClick();
                }
                break;
        }
    };


    return (
        <div className={`contact-box col-s-3 col-2 ${!contact.status?.sent ? 'unsent' : ''}`}>
            {/* <div style={{ display: "none" }}>{contact.id}</div> */}
            <div>
                <img
                    className="avatar"
                    src={contact.avatar ? `${process.env.REACT_APP_API_URL}/images/${contact.avatar}` : '/default-avatar.png'}
                    alt="Avatar"
                    onClick={handleAvatarClick}
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
                        <div>{contact.name} {getStatusMessage()}</div>
                        <div>{contact.phone}</div>
                    </>
                )}
                <div className="contact-actions">
                    {isEditing ? (
                        <button onClick={handleSaveClick}><FontAwesomeIcon icon={faSave} /></button>
                    ) : (
                        <>
                            {!contact.status?.sent ?
                                <button onClick={handleRetry} className="retry-btn">
                                    <FontAwesomeIcon icon={faRotateRight} />
                                </button>
                                :
                                <>
                                    <button onClick={handleEdit}><FontAwesomeIcon icon={faEdit} /></button>
                                    <button onClick={handleDelete}><FontAwesomeIcon icon={faTrash} /></button>
                                </>
                            }
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
