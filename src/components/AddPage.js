import { useNavigate } from "react-router-dom";

export default function AddPage() {
    const navigate = useNavigate()

    return (
        <div >
            <div><input></input></div>
            <div><input></input></div>
            <div><button>save</button><button onClick={() => navigate('/')}>cancel</button></div>
        </div>
    );
}