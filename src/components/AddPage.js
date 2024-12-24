import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addContact } from "../actions/contacts";

export default function AddPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = () => {
        if (name && phone) {
            dispatch(addContact(name, phone));
            navigate('/');
        }
    };

    return (
        <div className="flex-container2">
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
                <button className="add-page" onClick={handleSubmit}>save</button>
                <button className="add-page" onClick={() => navigate('/')}>cancel</button>
            </div>
        </div>
    );
}