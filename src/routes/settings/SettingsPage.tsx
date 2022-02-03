import React from "react"
import { useErrorHandler } from "react-error-boundary"

// Components
import PopupHeader from "../../components/popup/PopupHeader"
import PopupFooter from "../../components/popup/PopupFooter"
import PopupLayout from "../../components/popup/PopupLayout"
import VerticalSelect from "../../components/input/VerticalSelect"

// Style
import { Classes } from "../../styles/classes"
import { classnames } from "../../styles/classes"

// Assets
import book from "../../assets/images/icons/book.svg"
import lock from "../../assets/images/icons/lock.svg"
import logoutIcon from "../../assets/images/icons/logout.svg"
import account from "../../assets/images/icons/account.svg"

// Context
import { lockApp } from "../../context/commActions"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { useBlankState } from "../../context/background/backgroundHooks"
import classNames from "classnames"

// declare const VERSION: string

const SettingsPage = () => {
    const { isSeedPhraseBackedUp } = useBlankState()!
    const handleError = useErrorHandler()
    const history = useOnMountHistory()

    const options = [
        {
            icon: account,
            label: "Account",
            to: "/accounts/menu",
        },
        {
            icon: book,
            label: "Address Book",
            to: "/settings/addressBook",
        },
        {
            icon: lock,
            label: "Lock Timeout",
            to: "/settings/lockTimeout",
        },
    ]

    const logout = () => {
        try {
            lockApp()
        } catch {
            handleError("Error logging out")
        }
    }

    return (
        <PopupLayout
            header={<PopupHeader title="Settings" close="/" />}
            footer={
                <PopupFooter>
                    <button
                        type="button"
                        onClick={logout}
                        className={classnames(Classes.logoutButton, "w-full")}
                    >
                        <img
                            alt="Logout"
                            src={logoutIcon}
                            className={classnames(Classes.buttonIcon)}
                        />
                        Logout
                    </button>
                </PopupFooter>
            }
        >
            <div className="flex flex-col space-y-6 p-6">
                <div className="flex flex-col space-y-1">
                    <div className="flex flex-col space-y-4">
                        <VerticalSelect
                            options={options}
                            value={undefined}
                            onChange={(option) =>
                                option.to.includes("https://")
                                    ? chrome.tabs.create({ url: option.to })
                                    : history.push({
                                          pathname: option.to,
                                          state: {
                                              from: "/settings",
                                              ...(option.state ?? {}),
                                          },
                                      })
                            }
                            containerClassName="flex flex-col space-y-4"
                            display={(option, i) => {
                                const className =
                                    "flex flex-row space-x-3 items-center text-gray-900"
                                const children = (
                                    <>
                                        <div
                                            className={classnames(
                                                option.classes ?? ""
                                            )}
                                        >
                                            <img
                                                src={option.icon}
                                                alt="icon"
                                                className={
                                                    option.size ?? "w-5 h-5"
                                                }
                                            />
                                        </div>
                                        <span className="font-bold">
                                            {option.label}
                                        </span>
                                    </>
                                )
                                return (
                                    <div className={classnames(className)}>
                                        {children}
                                    </div>
                                )
                            }}
                        />
                        {!isSeedPhraseBackedUp && (
                            <div className="w-full border border-gray-200 rounded-md flex justify-between items-center p-4">
                                <span className="text-xs mr-2">
                                    Back your seed phrase up and store it in a
                                    safe place.
                                </span>
                                <button
                                    className={classNames(Classes.smallButton)}
                                    onClick={() => {
                                        history.push("/reminder")
                                    }}
                                >
                                    Backup
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {process.env.VERSION && (
                <div className="mb-1 mx-auto mt-auto">
                    <span className="text-xxs text-gray-500">
                        Version: v{process.env.VERSION}
                    </span>
                </div>
            )}
        </PopupLayout>
    )
}

export default SettingsPage
