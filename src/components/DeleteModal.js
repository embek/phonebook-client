import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideDeleteModal } from '../actions/modal';
import { removeContact } from '../actions/contacts';

export default function DeleteModal() {
    const dispatch = useDispatch();
    const contactId = useSelector(state => state.modal.contactIdToDelete);
    const contact = useSelector(state => state.contacts.find(c => c.id === contactId));

    if (!contact) {
        return null;
    }

    const handleConfirm = () => {
        if (contactId) {
            dispatch(removeContact(contactId));
            dispatch(hideDeleteModal());
        }
    };

    const handleCancel = () => {
        dispatch(hideDeleteModal());
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Delete Contact</h3>
                <p>Apakah anda yakin ingin menghapus {contact.name}?</p>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={handleConfirm}>Ya</button>
                    <button className="cancel-button" onClick={handleCancel}>Tidak</button>
                </div>
            </div>
        </div>
    );
}
