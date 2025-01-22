import { useContext } from "react";
import { CustomContext } from "./CustomContext";
import { handleContactOperation, setModal } from "../actions/contacts";

export default function DeleteModal({ contact }) {
    const { dispatch } = useContext(CustomContext);

    if (!contact) {
        return null;
    }

    const handleConfirm = async () => {
        try {
            await handleContactOperation({
                dispatch,
                operation: 'delete',
                id: contact.id
            });
            setModal({
                dispatch,
                modal: { isOpen: false, contactIdToDelete: null }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleCancel = () => {
        setModal({
            dispatch,
            modal: { isOpen: false, contactIdToDelete: null }
        });
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
