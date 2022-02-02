import React, { FC } from "react"
import { useBlankState } from "../../context/background/backgroundHooks"
import { dismissWelcomeMessage } from "../../context/commActions"
import WelcomeInfo from "../info/WelcomeInfo"

const WalletNews: FC = ({ children }) => {
    const state = useBlankState()

    if (state?.showWelcomeMessage) {
        return <WelcomeInfo onDismiss={dismissWelcomeMessage} />
    }
    return <>{children}</>
}

export default WalletNews
