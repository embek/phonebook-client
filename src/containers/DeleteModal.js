import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideDeleteModal } from '../actions/modal';
import { removeContact } from '../actions/contacts';

export default function DeleteModal() {
    const dispatch = useDispatch();
    const { isOpen, contactId } = useSelector(state => state.modal.deleteModal);
    const contact = useSelector(state => 
        state.contacts.find(c => c.id === contactId)
    );

    if (!isOpen) return null;

    const handleConfirm = () => {
        dispatch(removeContact(contactId));
        dispatch(hideDeleteModal());
    };

    const handleCancel = () => {
        dispatch(hideDeleteModal());
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Delete Contact</h3>
                <p>Are you sure you want to delete {contact?.name}?</p>
                <div className="modal-buttons">
                    <button onClick={handleConfirm}>Delete</button>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
