import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import PopupHeader from "../components/popup/PopupHeader"
import PopupLayout from "../components/popup/PopupLayout"
import ClickToReveal from "../components/label/ClickToReveal"
import { ButtonWithLoading } from "../components/button/ButtonWithLoading"
import PopupFooter from "../components/popup/PopupFooter"

const ReminderPage = () => {
    const history: any = useHistory()
    const [revealed, setRevealed] = useState<boolean>(false)
    const [seedPhrase, setSeedPhrase] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    useEffect(() => {
        setSeedPhrase(history.location.state.seedPhrase)
        setPassword(history.location.state.password)
    }, [])

    return (
        <PopupLayout
            header={
                <PopupHeader
                    title="You Haven’t Set Up a Backup"
                    backButton={false}
                />
            }
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        disabled={!revealed}
                        label="Backup Now"
                        onClick={() => {
                            history.push({
                                pathname: "/reminder/backup",
                                state: {
                                    seedPhrase,
                                    isReminder: true,
                                    password,
                                },
                            })
                        }}
                    />
                </PopupFooter>
            }
        >
            <div className="flex-1 flex flex-col items-center justify-center w-full h-0 max-h-screen p-6">
                <div className="flex flex-col space-y-8 p-2 text-gray-600 text-sm">
                    <span>
                        Your seed phrase is the key to your wallet and your
                        privacy deposits. It makes it possible to restore your
                        wallet after losing access. Import your seed phrase to
                        gain access to the funds held on your Blank Wallet.
                        Backup your seed phrase and store it in a safe place.
                    </span>
                    <span>
                        <b className="text-gray-900">Warning:</b> Never disclose
                        your seed phrase. Anyone asking for your seed phrase is
                        most likely trying to steal your funds.
                    </span>
                    <ClickToReveal
                        hiddenText={seedPhrase}
                        revealMessage={"Click here to reveal secret words"}
                        revealed={revealed}
                        onClick={() => setRevealed(true)}
                    />
                </div>
            </div>
        </PopupLayout>
    )
}

export default ReminderPage
