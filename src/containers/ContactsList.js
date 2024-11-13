import ContactItem from "./ContactItem";

export default function ContactList() {

    const rows = [];

    for (let i = 0; i < 10; i++) {
        rows.push(<ContactItem key={i} />);
    }

    return (
        <tbody >
            {rows}
        </tbody>
    );
}