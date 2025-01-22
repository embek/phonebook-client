import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function AddPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = async () => {
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        if (!trimmedName || !trimmedPhone) {
            alert('Please fill in both name and phone');
            return;
        }

        if (!/^\d+$/.test(trimmedPhone)) {
            alert('Please enter a valid phone number');
            return;
        }

        try {
            await api.post('api/phonebooks', { name: trimmedName, phone: trimmedPhone });
            navigate('/');
        } catch (error) {
            const existingContacts = JSON.parse(sessionStorage.getItem('local_contacts') || '[]');
            sessionStorage.setItem('local_contacts', JSON.stringify([
                {
                    id: 'temp-' + Date.now(),
                    name: trimmedName,
                    phone: trimmedPhone,
                    status: { sent: false, operation: 'add' }
                },
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
                <button
                    className="add-page-button"
                    onClick={handleSubmit}
                >
                    save
                </button>
                <button
                    className="add-page-button"
                    onClick={() => navigate('/')}
                >
                    cancel
                </button>
            </div>
        </div>
    );
}
