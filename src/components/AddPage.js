import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/contactsAPI";

export default function AddPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = async () => {
        if (!name.trim() || !phone.trim()) {
            alert('Please fill in both name and phone');
            return;
        }

        try {
            await api.post('api/phonebooks', { name: name.trim(), phone: phone.trim() });
            navigate('/');
        } catch (error) {
            const failedSubmission = {
                name: name.trim(),
                phone: phone.trim(),
                status: { sent: false, operation: 'add' }
            };
            
            const existingContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
            sessionStorage.setItem('local_contacts', JSON.stringify([
                { ...failedSubmission, id: 'temp-' + Date.now() },
                ...existingContacts
            ]));
            navigate('/');
        }
    };

    return (
        <div className="add-form">
            <input
                className="custom-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
            />
            <input
                className="custom-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
            />
            <div>
                <button className="add-page-button" onClick={handleSubmit}>save</button>
                <button className="add-page-button" onClick={() => navigate('/')}>cancel</button>
            </div>
        </div>
    );
}
