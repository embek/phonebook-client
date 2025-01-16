import { faEdit, faTrash, faSave, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CustomContext } from './CustomContext';
import { updateContact, resendContact } from '../actions/contacts';

export default function ContactItem({ contact }) {
    const { dispatch } = useContext(CustomContext);
    const navigate = useNavigate();
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({ name: contact.name, phone: contact.phone });

    const handleSaveClick = async () => {
        if (!formData.name.trim() || !formData.phone.trim()) {
            alert('Please fill in both name and phone');
            return;
        }

        if (!/^\d+$/.test(formData.phone.trim())) {
            alert('Phone number must contain only numeric characters');
            return;
        }

        try {
            await updateContact(dispatch, contact.id, formData.name, formData.phone);
            setIsEdit(false);
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarClick = () => {
        const avatarPath = contact.avatar ? `http://192.168.1.20:3000/images/${contact.avatar}` : '/default-avatar.png';
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

    const handleRetry = async () => {
        switch (contact.status?.operation) {
            case 'update':
                await handleSaveClick();
                break;
            case 'delete':
                dispatch({ type: 'SHOW_DELETE_MODAL', payload: { contactId: contact.id } });
                break;
            case 'add':
                await resendContact(dispatch, contact);
                break;
            default:
                if (formData.name !== contact.name || formData.phone !== contact.phone) {
                    await handleSaveClick();
                }
                break;
        }
    };

    const handleDelete = () => {
        dispatch({ 
            type: 'TOGGLE_MODAL', 
            payload: { isOpen: true, contactId: contact.id } 
        });
    };

    return (
        <div className={`contact-box col-s-3 col-2 ${!contact.status?.sent ? 'unsent' : ''}`} data-testid="contact-box">
            <div>
                <img
                    className="avatar"
                    src={contact.avatar ? `http://192.168.1.20:3000/images/${contact.avatar}` : '/default-avatar.png'}
                    alt="Avatar"
                    onClick={handleAvatarClick}
                />
            </div>
            <div className="contact-detail">
                {isEdit ? (
                    <>
                        <input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="edit-input"
                        />
                        <input
                            value={formData.phone}
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
                    {isEdit ? (
                        <button onClick={handleSaveClick}><FontAwesomeIcon icon={faSave} /></button>
                    ) : (
                        <>
                            {!contact.status?.sent ?
                                <button onClick={handleRetry} className="retry-btn">
                                    <FontAwesomeIcon icon={faRotateRight} />
                                </button>
                                :
                                <>
                                    <button onClick={() => setIsEdit(true)}><FontAwesomeIcon icon={faEdit} /></button>
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
