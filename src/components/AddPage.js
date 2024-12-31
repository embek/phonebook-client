import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddPage({ onAddContact }) {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = () => {
        if (name && phone) {
            onAddContact(name, phone);
            navigate('/');
        }
    };

    return (
        <div className="add-form">
            <div><input 
                className="custom-input" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
            /></div>
            <div><input 
                className="custom-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
            /></div>
            <div>
                <button className="add-page-button" onClick={handleSubmit}>save</button>
                <button className="add-page-button" onClick={() => navigate('/')}>cancel</button>
            </div>
        </div>
    );
}