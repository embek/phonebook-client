export default function DeleteModal({ contact, onConfirm, onCancel }) {
    if (!contact) {
        return null;
    }

    const handleConfirm = async () => {
        try {
            await onConfirm(contact.id);
        } catch (error) {
            alert('Failed to delete contact: ' + error.message);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Delete Contact</h3>
                <p>Apakah anda yakin ingin menghapus {contact.name}?</p>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={handleConfirm}>Ya</button>
                    <button className="cancel-button" onClick={onCancel}>Tidak</button>
                </div>
            </div>
        </div>
    );
}
