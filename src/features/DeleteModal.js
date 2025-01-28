import { useDispatch, useSelector } from "react-redux";
import { handleContactOperation, setModal } from "./phonebookSlice";

export default function DeleteModal() {
    const dispatch = useDispatch();
    const { contacts, modal } = useSelector(state => state.phonebook);
    const contact = contacts.find(c => c.id === modal.contactIdToDelete);

    if (!contact) {
        return null;
    }

    const handleConfirm = async () => {
        try {
            await dispatch(handleContactOperation({
                operation: 'delete',
                id: contact.id
            }))
            dispatch(setModal({ isOpen: false, contactIdToDelete: null }));
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleCancel = () => {
        dispatch(setModal({ isOpen: false, contactIdToDelete: null }));
    }

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
