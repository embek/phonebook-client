import ContactItem from "./ContactItem";

export default function ContactList() {

    const rows = [];

    for (let i = 0; i < 4; i++) {
        rows.push(<ContactItem key={i} />);
    }

    return (
        <tbody >
            {rows}
        </tbody>
    );
}