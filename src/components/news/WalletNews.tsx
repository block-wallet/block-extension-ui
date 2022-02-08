import React, { FC } from "react"
import { useBlankState } from "../../context/background/backgroundHooks"
import {
    dismissReleaseNotes,
    dismissWelcomeMessage,
} from "../../context/commActions"
import ReleaseNotesInfo from "../info/ReleaseNotesInfo"
import WelcomeInfo from "../info/WelcomeInfo"

const WalletNews: FC = ({ children }) => {
    const state = useBlankState()!
    if (state?.showWelcomeMessage) {
        return <WelcomeInfo onDismiss={dismissWelcomeMessage} />
    }
    if (state.releaseNotesSettings?.latestReleaseNotes?.length) {
        return (
            <ReleaseNotesInfo
                releaseNotes={state.releaseNotesSettings.latestReleaseNotes}
                onDismiss={dismissReleaseNotes}
            />
        )
    }
    return <>{children}</>
}

export default WalletNews
