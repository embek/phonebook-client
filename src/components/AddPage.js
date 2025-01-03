import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/contactsAPI";

export default function AddPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]+$/.test(value)) {
            setPhone(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            alert('Please fill in both name and phone');
            return;
        }

        if (!/^[0-9]+$/.test(phone)) {
            alert('Phone number must contain only numbers');
            return;
        }

        try {
            await api.post('api/phonebooks', { name: name.trim(), phone: phone.trim() });
            navigate('/');
        } catch (error) {
            alert('Failed to add contact: ' + error.message);
        }
    };

    return (
        <form className="add-form" onSubmit={handleSubmit}>
            <input
                className="custom-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
            />
            <input
                className="custom-input"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Phone"
                required
            />
            <div>
                <button type="submit" className="add-page-button">save</button>
                <button type="button" className="add-page-button" onClick={() => navigate('/')}>cancel</button>
            </div>
        </form>
    );
}
