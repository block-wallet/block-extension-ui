import React, { FC } from "react"
import { LINKS } from "../../util/constants"
import { ButtonWithLoading } from "../button/ButtonWithLoading"
import PopupFooter from "../popup/PopupFooter"
import PopupLayout from "../popup/PopupLayout"
import Info from "./Info"

interface WelcomeInfoProps {
    onDismiss: () => void
}
const WelcomeInfo: FC<WelcomeInfoProps> = ({ onDismiss }) => {
    return (
        <PopupLayout
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        onClick={onDismiss}
                        label="Start To Use"
                    />
                </PopupFooter>
            }
        >
            <div className="w-full p-6 bg-white bg-opacity-75">
                <Info>
                    <Info.Title>Welcome to BlockWallet!</Info.Title>
                    <div className="p-1 pt-6">
                        <Info.List>
                            <Info.Item type="warn">
                                Be sure to set BlockWallet as your default
                                browser wallet to interact with DApps.
                            </Info.Item>
                            <Info.Item type="warn">
                                If you don’t see our logo when connecting,
                                select another browser wallet’s logo.
                            </Info.Item>
                            <Info.Item type="warn">
                                Join our{" "}
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href={LINKS.TELEGRAM}
                                    className="text-decoration-line: underline; text-blue-600 hover:text-blue-800"
                                >
                                    Telegram group
                                </a>{" "}
                                if you have any questions or feedback.
                            </Info.Item>
                            <Info.Item type="success" className="mt-20">
                                We hope that you enjoy using the wallet!
                            </Info.Item>
                        </Info.List>
                    </div>
                </Info>
            </div>
        </PopupLayout>
    )
}

export default WelcomeInfo
