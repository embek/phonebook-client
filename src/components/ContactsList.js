import ContactItem from "./ContactItem";

export default function ContactList({ contacts, onShowDeleteModal, updateContact }) {
    return (
        <div className="contacts-list">
            {contacts.map(contact => (
                <ContactItem
                    key={contact.id}
                    contact={contact}
                    onShowDeleteModal={onShowDeleteModal}
                    onUpdateContact={updateContact}
                />
            ))}
        </div>
    );
}
