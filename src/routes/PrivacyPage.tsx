import React, { useState } from "react"

// Components
import PopupHeader from "../components/popup/PopupHeader"
import PopupLayout from "../components/popup/PopupLayout"
import VerticalSelect from "../components/input/VerticalSelect"

// Assets
import compliance from "../assets/images/icons/compliance.svg"
import tornado from "../assets/images/icons/tornado.svg"

// Context
import { useOnMountHistory } from "../context/hooks/useOnMount"
import { forceDepositsImport } from "../context/commActions"
import AccountIcon from "../components/icons/AccountIcon"
import { useBlankState } from "../context/background/backgroundHooks"
import classnames from "classnames"
import Spinner from "../components/Spinner"

/**
 * PrivacyPage:
 */
const PrivacyPage = () => {
    const history = useOnMountHistory()
    const {
        isImportingDeposits,
        importingErrors,
        isUserNetworkOnline,
    } = useBlankState()!

    const [isLoading, setIsLoading] = useState(false)

    const thereIsImportDepositErrors =
        importingErrors && importingErrors.length > 0

    return (
        <PopupLayout header={<PopupHeader title="Privacy" close="/" />}>
            <div className="flex flex-col space-y-7 p-6">
                <div className="space-y-4">
                    <span className="text-xs">BLANK ACTIONS</span>
                    <div className="flex flex-row space-x-4 items-center justify-evenly">
                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    !isImportingDeposits &&
                                    !thereIsImportDepositErrors
                                ) {
                                    history.push("/privacy/deposit")
                                }
                            }}
                            className={classnames(
                                "bg-primary-100 rounded-md p-4 w-1/2 flex flex-col items-center group space-y-3 cursor-pointer hover:bg-primary-200",
                                (isImportingDeposits || !isUserNetworkOnline) &&
                                    "opacity-50 pointer-events-none"
                            )}
                            disabled={
                                isImportingDeposits ||
                                thereIsImportDepositErrors ||
                                !isUserNetworkOnline
                            }
                        >
                            <div className="w-full flex justify-center text-primary-300">
                                {isImportingDeposits ? (
                                    <Spinner size="32" color="black" />
                                ) : (
                                    <AccountIcon className="fill-current h-8 w-8" />
                                )}
                            </div>
                            <span className="text-sm font-bold text-center">
                                Blank Deposit
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    !isImportingDeposits &&
                                    !thereIsImportDepositErrors
                                ) {
                                    history.push("/privacy/withdraw")
                                }
                            }}
                            className={classnames(
                                "bg-primary-100 rounded-md p-4 w-1/2 flex flex-col items-center group space-y-3 cursor-pointer hover:bg-primary-200",
                                (isImportingDeposits || !isUserNetworkOnline) &&
                                    "opacity-50 pointer-events-none"
                            )}
                            disabled={
                                isImportingDeposits ||
                                thereIsImportDepositErrors ||
                                !isUserNetworkOnline
                            }
                        >
                            <div className="w-full flex justify-center text-black">
                                {isImportingDeposits ? (
                                    <Spinner size="32" color="black" />
                                ) : (
                                    <AccountIcon className="fill-current h-8 w-8" />
                                )}
                            </div>
                            <span className="text-sm font-bold text-center">
                                Blank Withdraw
                            </span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-col space-y-4">
                    <span className="text-xs">OTHER</span>

                    <VerticalSelect
                        options={[
                            {
                                icon: compliance,
                                label: "Compliance (Withdrawals History)",
                                to: "/privacy/withdrawals",
                            },
                            {
                                icon: tornado,
                                label: "Reconstruct Tornado Notes",
                                to: "/",
                                name: "reconstruct",
                            },
                        ]}
                        value={undefined}
                        onChange={(option) => {
                            if (option.name === "reconstruct")
                                forceDepositsImport()
                            option.to.includes("https://")
                                ? chrome.tabs.create({ url: option.to })
                                : history.push(option.to)
                        }}
                        containerClassName="flex flex-col space-y-3"
                        display={(option, i) => {
                            const className =
                                "flex flex-row space-x-3 items-center text-gray-900"
                            const children = (
                                <>
                                    <img
                                        src={option.icon}
                                        alt="icon"
                                        className="w-5 h-5"
                                    />
                                    <span className="font-bold">
                                        {option.label}
                                    </span>
                                </>
                            )
                            return <div className={className}>{children}</div>
                        }}
                        isDisabled={(option) =>
                            isImportingDeposits ||
                            (option.name === "reconstruct" &&
                                !isUserNetworkOnline)
                        }
                    />
                </div>
                {/*<hr className="border-0.5 border-gray-200 w-full" />*/}
                {!isImportingDeposits && thereIsImportDepositErrors && (
                    <div className="flex flex-row items-center w-full p-4 mt-auto text-center bg-red-100 rounded-md">
                        <span className="w-3/4 text-sm text-red-600 text-left">
                            We found an error trying to import your deposits.
                            Try one more time.
                        </span>

                        <div className="w-1/4">
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsLoading(true)
                                    await forceDepositsImport()
                                    setTimeout(() => {
                                        setIsLoading(false)
                                    }, 10000)
                                }}
                                className={classnames(
                                    "w-100 rounded-md cursor-pointer font-normal hover:bg-gray-50 border border-red-600 p-1 bg-white text-red-600",
                                    isLoading &&
                                        "opacity-50 pointer-events-none"
                                )}
                                disabled={isLoading}
                            >
                                {!isLoading ? "Retry" : <Spinner color="red" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PopupLayout>
    )
}

export default PrivacyPage
