import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./components/App.tsx"
import "./css/Main.css"
import { TranslationProvider } from "./components/TranslationContext.tsx"


// Entry point of the React application:
// This is where the root <App /> component is rendered into the DOM.

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <TranslationProvider>
            <App />
        </TranslationProvider>
    </StrictMode>,
)
