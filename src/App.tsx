import React from "react"
import GlobalModal from "./components/GlobalModal"
import BackgroundState from "./context/background/BackgroundState"
import { ModalProvider } from "./context/ModalContext"
import Spinner from "./components/Spinner"
import { useBlankState } from "./context/background/backgroundHooks"
import { isPopup } from "./context/util/isPopup"
import PopupRouter from "./router/PopupRouter"
import TabRouter from "./router/TabRouter"

const AppLoading = () => {
    return (
        <div className="w-full h-full flex flex-row items-center justify-center bg-primary-100">
            <Spinner />
        </div>
    )
}

const App = () => {
    const blankState = useBlankState()
    return blankState ? (
        <ModalProvider>
            <GlobalModal />
            {isPopup() ? <PopupRouter /> : <TabRouter />}
        </ModalProvider>
    ) : (
        <AppLoading />
    )
}

const WrappedApp = () => (
    <BackgroundState>
        <App />
    </BackgroundState>
)

export default WrappedApp
