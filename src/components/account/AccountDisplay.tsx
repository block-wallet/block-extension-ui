import React, { useState, useRef } from "react"
import { FunctionComponent } from "react"

import { formatUnits } from "ethers/lib/utils"
import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import { formatName, formatHash } from "../../util/formatAccount"
import { getAccountColor } from "../../util/getAccountColor"
import { formatNumberLength } from "../../util/formatNumberLength"

import AccountIcon from "../icons/AccountIcon"
import checkmarkIcon from "../../assets/images/icons/checkmark_mini.svg"
import blueDotsIcon from "../../assets/images/icons/blue_dots.svg"
import editIcon from "../../assets/images/icons/pencil.svg"
import { classnames } from "../../styles"
import TrashBinIcon from "../icons/TrashBinIcon"
import ThreeDotsIcon from "../icons/ThreeDotsIcon"
import { useOnClickOutside } from "../../util/useOnClickOutside"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import ConfirmDialog from "../dialog/ConfirmDialog"
import CopyTooltip from "../label/СopyToClipboardTooltip"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import GearIcon from "../icons/GearIcon"

const AccountDisplay: FunctionComponent<{
    networkNativeCurrency: {
        symbol: string
        decimals: number
    }
    account: AccountInfo
    selected: boolean
    showSelectedCheckmark?: boolean
    defaultAccount?: boolean
    showAddress?: boolean
    withOptions?: boolean
    canCopy?: boolean
    showAccountDetailsIcon?: boolean
    showEditButton?: boolean
    handleRemoveContact?: any
}> = ({
    account,
    selected,
    showSelectedCheckmark = true,
    networkNativeCurrency,
    defaultAccount = false,
    showAddress = false,
    withOptions = false,
    canCopy = false,
    showAccountDetailsIcon = false,
    showEditButton = false,
    handleRemoveContact = () => {},
}) => {
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const [copied, setCopied] = useState(false)
    const history: any = useOnMountHistory()
    const { chainId } = useSelectedNetwork()

    const hover = !selected && !showEditButton && !withOptions && !canCopy

    const dropdownRef = useRef<any>(null)
    useOnClickOutside(dropdownRef, () => setShowOptions(false))

    const copyToClipboard = async () => {
        if (canCopy) {
            await navigator.clipboard.writeText(account.address)
            setCopied(true)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setCopied(false)
        }
    }

    return (
        <div
            className={classnames(
                "flex flex-row items-center justify-between w-full rounded-md",
                defaultAccount && "pr-2",
                hover && "hover:bg-primary-100 cursor-pointer"
            )}
        >
            <div
                className="flex flex-row items-center space-x-3 text-gray-900 p-2"
                role="link"
                data-testid="account-icon"
            >
                <AccountIcon
                    className="w-10 h-10"
                    fill={getAccountColor(account?.address)}
                />
                <div className="flex flex-col">
                    <div
                        //role="button"
                        className={classnames(
                            "relative flex flex-col items-start group",
                            canCopy && "cursor-pointer"
                        )}
                        onClick={() => canCopy && copyToClipboard()}
                    >
                        <span className="font-bold">
                            {formatName(account.name, 24)}{" "}
                            {!showAddress
                                ? "(..." + account.address.substr(-4) + ")"
                                : ""}
                        </span>
                        {!showAddress ? (
                            <span className="text-gray-500">
                                {formatNumberLength(
                                    formatUnits(
                                        account.balances[chainId]
                                            .nativeTokenBalance || "0",
                                        networkNativeCurrency.decimals
                                    ),
                                    10
                                )}{" "}
                                {networkNativeCurrency.symbol}
                            </span>
                        ) : (
                            <span className="text-gray-500">
                                {formatHash(account?.address)}
                            </span>
                        )}
                        {canCopy ? (
                            <CopyTooltip copied={copied}></CopyTooltip>
                        ) : null}
                    </div>
                    {account.external ? (
                        <span className="px-2 py-1 w-16 text-xs text-white bg-blue-400 rounded-md">
                            External
                        </span>
                    ) : null}
                </div>
            </div>
            <div className="flex flex-row items-center space-x-3">
                {selected && showSelectedCheckmark ? (
                    <img
                        src={checkmarkIcon}
                        alt="checkmark"
                        className="w-4 h-4"
                    />
                ) : null}

                {defaultAccount ? (
                    <span className="px-1 py-1 text-xs text-white bg-gray-600 rounded-md">
                        Default
                    </span>
                ) : null}

                {withOptions ? (
                    <div className="relative" ref={dropdownRef}>
                        <div
                            className={classnames(
                                "p-2 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300 cursor-pointer",
                                showOptions
                                    ? "bg-primary-100 text-primary-300"
                                    : ""
                            )}
                            onClick={() => {
                                setShowOptions(!showOptions)
                            }}
                        >
                            {showOptions ? (
                                <img
                                    src={blueDotsIcon}
                                    alt="options"
                                    className="w-4 h-4"
                                />
                            ) : (
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <ThreeDotsIcon />
                                </div>
                            )}
                        </div>
                        {/* options box */}
                        <div
                            className={classnames(
                                "absolute shadow-md bg-white w-32 mt-2 right-0 select-none rounded-md z-50 font-semibold",
                                showOptions ? "" : "hidden"
                            )}
                        >
                            <div
                                className="flex flex-row justify-start items-center w-full p-2 cursor-pointer text-black hover:bg-gray-100"
                                onClick={() =>
                                    history.push({
                                        pathname: "/settings/addressBook/add",
                                        state: {
                                            editMode: true,
                                            contact: account,
                                        },
                                    })
                                }
                            >
                                <div className="pl-2 pr-3">
                                    <img src={editIcon} alt="Edit"></img>
                                </div>
                                <span>Edit</span>
                            </div>
                            <div
                                className="flex flex-row justify-start items-center w-full p-2 cursor-pointer text-red-500 hover:bg-gray-100"
                                onClick={() => setConfirmOpen(true)}
                            >
                                <div className="pl-2 pr-3">
                                    <TrashBinIcon fill="red" />
                                </div>
                                <span>Remove</span>
                            </div>
                        </div>
                    </div>
                ) : null}

                {showAccountDetailsIcon ? (
                    <div
                        onClick={() => {
                            history.push("/accounts/menu")
                        }}
                        className="cursor-pointer p-2 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300"
                    >
                        <GearIcon />
                    </div>
                ) : null}

                {showEditButton && !defaultAccount ? (
                    <div
                        onClick={() => {
                            history.push("/accounts/menu/edit")
                        }}
                        className="cursor-pointer p-2 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300"
                        draggable={false}
                    >
                        <img src={editIcon} alt="Edit"></img>
                    </div>
                ) : null}
            </div>
            <ConfirmDialog
                title="Remove contact"
                message={`Do you want to remove ${account?.name} contact?`}
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => handleRemoveContact(account?.address)}
            />
        </div>
    )
}

export default AccountDisplay
