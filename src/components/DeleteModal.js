import { useContext } from 'react';
import { CustomContext } from './CustomContext';
import { removeContact } from '../actions/contacts';

export default function DeleteModal() {
    const { state, dispatch } = useContext(CustomContext);
    const { contacts, modal } = state;
    const { isOpen, contactIdToDelete } = modal;

    if (!isOpen) return null;

    const contact = contacts.find(c => c.id === contactIdToDelete);
    if (!contact) return null;

    const handleConfirm = async () => {
        try {
            await removeContact(dispatch, contact.id);
            dispatch({ type: 'TOGGLE_MODAL', payload: { isOpen: false } });
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Delete Contact</h3>
                <p>Apakah anda yakin ingin menghapus {contact.name}?</p>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={handleConfirm}>Ya</button>
                    <button
                        className="cancel-button"
                        onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: { isOpen: false } })}
                    >
                        Tidak
                    </button>
                </div>
            </div>
        </div>
    );
}
