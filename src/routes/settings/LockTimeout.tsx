import React, { useState, useEffect } from "react"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import PopupFooter from "../../components/popup/PopupFooter"
import { getIdleTimeout, setIdleTimeout } from "../../context/commActions"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import WaitingDialog, {
    useWaitingDialog,
} from "../../components/dialog/WaitingDialog"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import ToggleButton from "../../components/button/ToggleButton"
import Dropdown from "../../components/input/Dropdown"

const LockTimeout = () => {
    const history = useOnMountHistory()!
    const [currentTimeout, setCurrentTimeout] = useState(5)
    const [selectedTimeout, setSelectedTimeout] = useState(5)
    const [timeoutEnabled, setTimeoutEnabled] = useState(false)

    const { isOpen, status, dispatch } = useWaitingDialog()

    useEffect(() => {
        getIdleTimeout().then((timeout) => {
            setTimeoutEnabled(timeout !== 0)
            setCurrentTimeout(timeout)
            setSelectedTimeout(timeout)
        })
    }, [])

    useEffect(() => {
        setSelectedTimeout(
            timeoutEnabled ? (currentTimeout === 0 ? 5 : currentTimeout) : 0
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeoutEnabled])

    const onSave = async () => {
        try {
            dispatch({ type: "open", payload: { status: "loading" } })

            await setIdleTimeout(selectedTimeout)

            dispatch({ type: "setStatus", payload: { status: "success" } })
        } catch (error) {
            dispatch({ type: "setStatus", payload: { status: "error" } })
            // throw new Error("Could not update the lock timeout")
        }
    }

    return (
        <PopupLayout
            header={<PopupHeader title="Lock Timeout" />}
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        label="Save"
                        disabled={selectedTimeout === currentTimeout}
                        onClick={onSave}
                    />
                </PopupFooter>
            }
        >
            <WaitingDialog
                open={isOpen}
                status={status}
                titles={{
                    loading: "Loading",
                    success: "Congratulations",
                    error: "Error",
                }}
                texts={{
                    loading: "Saving your changes...",
                    success: "Your changes have been succesfully saved!",
                    error: "There was an error while updating the lock timeout",
                }}
                timeout={800}
                onDone={() => {
                    if (status === "error") {
                        dispatch({ type: "close" })
                        return
                    }

                    history.push("/")
                }}
            />
            <div className="flex flex-col p-6 space-y-6 w-full">
                <span className="text-sm text-gray-500">
                    BlockWallet will automatically lock and require an
                    additional login after the selected period.
                </span>
                <ToggleButton
                    label="Enabled"
                    defaultChecked={timeoutEnabled}
                    onToggle={(checked: boolean) => {
                        setTimeoutEnabled(checked)
                    }}
                />
                {timeoutEnabled && selectedTimeout !== 0 && (
                    <div className="flex flex-col space-y-2">
                        <Dropdown
                            onChange={setSelectedTimeout}
                            currentValue={selectedTimeout}
                            id="period"
                            label="Period"
                        >
                            <Dropdown.DropdownItem value={1}>
                                1 minute
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={3}>
                                3 minutes
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={5}>
                                5 minutes
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={15}>
                                15 minutes
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={30}>
                                30 minutes
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={60}>
                                1 hour
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={180}>
                                3 hours
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={360}>
                                6 hours
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={720}>
                                12 hours
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value={1440}>
                                1 day
                            </Dropdown.DropdownItem>
                        </Dropdown>
                    </div>
                )}
            </div>
        </PopupLayout>
    )
}

export default LockTimeout
