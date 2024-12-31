
import {createRoot} from "react-dom/client";
//import {StrictMode} from "react";
import {TestApp} from "./TestApp.tsx";

//strict mode causes double renders. see https://stackoverflow.com/questions/62185425/why-is-console-log-logging-twice-in-react-js
createRoot(document.getElementById('root')!).render(
    //<StrictMode>
        <TestApp />
    //</StrictMode>,
)