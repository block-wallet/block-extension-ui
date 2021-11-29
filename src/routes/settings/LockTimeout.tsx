import React, { useState, useEffect } from "react"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import PopupFooter from "../../components/popup/PopupFooter"
import TimeoutSelect from "../../components/input/TimeoutSelect"
import { getIdleTimeout, setIdleTimeout } from "../../context/commActions"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import SuccessDialog from "../../components/dialog/SuccessDialog"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import ToggleButton from "../../components/button/ToggleButton"

const LockTimeout = () => {
    const history = useOnMountHistory()!
    const [saved, setSaved] = useState(false)
    const [currentTimeout, setCurrentTimeout] = useState(5)
    const [selectedTimeout, setSelectedTimeout] = useState(5)
    const [timeoutEnabled, setTimeoutEnabled] = useState(false)

    const list = [
        {
            caption: "1 minute",
            value: 1,
        },
        {
            caption: "3 minutes",
            value: 3,
        },
        {
            caption: "5 minutes",
            value: 5,
        },
        {
            caption: "15 minutes",
            value: 15,
        },
        {
            caption: "30 minutes",
            value: 30,
        },
        {
            caption: "1 hour",
            value: 60,
        },
        {
            caption: "3 hours",
            value: 180,
        },
        {
            caption: "6 hours",
            value: 360,
        },
        {
            caption: "12 hours",
            value: 720,
        },
        {
            caption: "1 day",
            value: 1440,
        },
    ]

    useEffect(() => {
        getIdleTimeout().then((timeout) => {
            setTimeoutEnabled(timeout !== 0)
            setCurrentTimeout(timeout)
            setSelectedTimeout(timeout)
        })
    }, [])

    const onSave = async () => {
        try {
            await setIdleTimeout(selectedTimeout)
            setSaved(true)
        } catch (error) {
            throw new Error("Could not update the lock timeout")
        }
    }

    return (
        <PopupLayout
            header={<PopupHeader title="Lock Timeout" close="/" />}
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
            <SuccessDialog
                open={saved}
                title="Congratulations"
                timeout={1400}
                message="Your changes have been succesfully saved!"
                onDone={() => history.push("/")}
            />
            <div className="flex flex-col p-6 space-y-6 w-full">
                <span className="text-sm text-gray-500">
                    Blank Wallet will automatically lock and require an
                    additional login after the selected period.
                </span>
                <ToggleButton
                    label="Enabled"
                    isChecked={timeoutEnabled}
                    onToggle={(checked: boolean) => {
                        setTimeoutEnabled(checked)
                        setSelectedTimeout(
                            checked
                                ? currentTimeout === 0
                                    ? 5
                                    : currentTimeout
                                : 0
                        )
                    }}
                />
                {timeoutEnabled && (
                    <div className="flex flex-col space-y-2">
                        <span className="text-xs text-gray-500">Period</span>
                        <TimeoutSelect
                            list={list}
                            currentValue={currentTimeout}
                            selectedValue={selectedTimeout}
                            setSelectedValue={
                                setSelectedTimeout as (
                                    item: string | number
                                ) => void
                            }
                        />
                    </div>
                )}
            </div>
        </PopupLayout>
    )
}

export default LockTimeout
