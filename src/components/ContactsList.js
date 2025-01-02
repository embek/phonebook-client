import ContactItem from "./ContactItem";
import { useSelector } from "react-redux";

export default function ContactList() {
    const contacts = useSelector(state => state.contacts);

    return (
        <>
            <div className="contacts-list">
                {contacts.map(contact => (
                    <ContactItem
                        key={contact.id}
                        id={contact.id}
                    />
                ))}
            </div>
        </>
    );
}