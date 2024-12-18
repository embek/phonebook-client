import { useNavigate } from "react-router-dom";

export default function AddPage() {
    const navigate = useNavigate()

    return (
        <div className="flex-container2" >
            <div><input className="custom-input"></input></div>
            <div><input className="custom-input"></input></div>
            <div><button className="add-page">save</button><button className="add-page" onClick={() => navigate('/')}>cancel</button></div>
        </div>
    );
}