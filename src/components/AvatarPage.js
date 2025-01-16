import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from "../services/api";
import { CustomContext } from './CustomContext';
import { updateAvatar } from '../actions/contacts';

export default function AvatarPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { dispatch } = useContext(CustomContext);
    const [currentAvatar, setCurrentAvatar] = useState('http://192.168.1.20:3001/default-avatar.png');
    let selectedFile = null;

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const response = await api.get(`api/phonebooks/${id}`);
                if (response.data.avatar) setCurrentAvatar(`http://192.168.1.20:3000/images/${response.data.avatar}`);
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchAvatar();
    }, [id]);

    const handleAvatarChange = (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) document.querySelector('.avatar-preview').src = URL.createObjectURL(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        try {
            await updateAvatar(dispatch, id, selectedFile);
            navigate('/');
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className="avatar-page">
            <form onSubmit={handleSubmit}>
                <h2>Update Avatar</h2>
                <img
                    src={currentAvatar}
                    alt="Avatar"
                    className="avatar-preview"
                />
                <input
                    type="file"
                    onChange={handleAvatarChange}
                    accept="image/*"
                />
                <div className="button-container">
                    <button type="submit">
                        Upload Avatar
                    </button>
                    <button type="button" onClick={() => navigate('/')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
