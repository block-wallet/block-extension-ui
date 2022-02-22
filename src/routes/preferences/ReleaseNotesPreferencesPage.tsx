import React, { useState } from "react"
import { useHistory } from "react-router-dom"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import ToggleButton from "../../components/button/ToggleButton"
import SuccessDialog from "../../components/dialog/SuccessDialog"
import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import { useBlankState } from "../../context/background/backgroundHooks"
import { toggleReleaseNotesSubscription } from "../../context/commActions"

const ReleaseNotesPreferencesPage = () => {
    const { settings } = useBlankState()!
    const history = useHistory()
    const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false)
    const [
        subscribedReleaseNotes,
        setSubscribedToReleaseNotes,
    ] = useState<boolean>(settings.subscribedToReleaseaNotes)
    const onSave = async () => {
        try {
            await toggleReleaseNotesSubscription(subscribedReleaseNotes)
            setShowSuccessDialog(true)
        } catch (e) {
            throw new Error("Could not update release notes subscription")
        }
    }
    const isDirty =
        subscribedReleaseNotes !== settings.subscribedToReleaseaNotes
    return (
        <PopupLayout
            header={<PopupHeader title="Release Notes" close="/" />}
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        label="Save"
                        disabled={!isDirty}
                        onClick={onSave}
                    />
                </PopupFooter>
            }
        >
            <div className="flex flex-col p-6 space-y-6 w-full">
                <span className="text-sm text-gray-500">
                    Be up-to-date with latest BlockWallet news.
                </span>
                <SuccessDialog
                    open={showSuccessDialog}
                    title="Release Notes"
                    timeout={800}
                    message="Your changes have been succesfully saved!"
                    onDone={history.goBack}
                />
                <ToggleButton
                    label="Show Release Notes"
                    defaultChecked={subscribedReleaseNotes}
                    onToggle={setSubscribedToReleaseNotes}
                />
            </div>
        </PopupLayout>
    )
}

export default ReleaseNotesPreferencesPage
