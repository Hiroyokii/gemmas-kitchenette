import { useEffect } from "react";
import { login } from "./services/auth.service";

function App() {
    useEffect(() => {
        login({
            email: "joshua@example.com",
            password: "Password123",
        })
            .then(console.log)
            .catch(console.error);
    }, []);

    return <h1>Gemma's Kitchenette</h1>;
}

export default App;