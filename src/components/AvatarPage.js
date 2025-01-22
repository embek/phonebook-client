import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from "../services/api";

export default function AvatarPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentAvatar, setCurrentAvatar] = useState(`${process.env.REACT_APP_BASE_URL}/default-avatar.png`);
    let selectedFile = null;

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const response = await api.get(`api/phonebooks/${id}`);
                if (response.data.avatar) setCurrentAvatar(`${process.env.REACT_APP_API_URL}/images/${response.data.avatar}`);
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

        const formData = new FormData();
        formData.append('avatar', selectedFile);
        console.log('formData:', formData);

        try {
            await api.put(`api/phonebooks/${id}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
