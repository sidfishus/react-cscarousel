
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {TestApp} from "./TestApp.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TestApp />
    </StrictMode>,
)