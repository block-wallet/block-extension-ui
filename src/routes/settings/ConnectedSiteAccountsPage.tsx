import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import { formatUnits } from "ethers/lib/utils"
import React, { FunctionComponent, useMemo, useRef, useState } from "react"
import { BiRadioCircleMarked } from "react-icons/bi"
import { Redirect } from "react-router-dom"
import AccountIcon from "../../components/icons/AccountIcon"
import ThreeDotsIcon from "../../components/icons/ThreeDotsIcon"
import blueDotsIcon from "../../assets/images/icons/blue_dots.svg"
import TrashBinIcon from "../../components/icons/TrashBinIcon"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import ConfirmDialog from "../../components/dialog/ConfirmDialog"
import { useBlankState } from "../../context/background/backgroundHooks"
import {
    removeAccountFromSite,
    selectAccount,
    updateSitePermissions,
} from "../../context/commActions"
import {
    useOnMountHistory,
    useOnMountLocation,
} from "../../context/hooks/useOnMount"
import { classnames } from "../../styles"
import { formatNumberLength } from "../../util/formatNumberLength"
import { useOnClickOutside } from "../../util/useOnClickOutside"
import { getAccountColor } from "../../util/getAccountColor"
import WarningTip from "../../components/label/WarningTip"
import { useTokensList } from "../../context/hooks/useTokensList"

export type ConnectedSiteAccountsLocationState = {
    origin: string
    fromRoot?: boolean
}

const ConnectedSiteAccount: FunctionComponent<{
    account: AccountInfo
    active: boolean
    connected?: boolean
    handleRemoveFromSite: (address: string) => void
    handleConnectSite: (address: string) => void
    handleSwitchAccount: (address: string) => void
}> = ({
    account,
    active,
    connected = true,
    handleRemoveFromSite,
    handleConnectSite,
    handleSwitchAccount,
}) => {
    const [showOptions, setShowOptions] = useState(false)
    const [hasDialog, setHasDialog] = useState(false)

    const { selectedAddress, networkNativeCurrency } = useBlankState()!
    const { nativeToken } = useTokensList()

    const ref = useRef(null)
    useOnClickOutside(ref, () => setShowOptions(false))

    return (
        <>
            <ConfirmDialog
                title="Remove site connection"
                message={`Do you want to remove ${account.name} connection?`}
                open={hasDialog}
                onClose={() => setHasDialog(false)}
                onConfirm={() => {
                    handleRemoveFromSite(account.address)
                    setShowOptions(!showOptions)
                }}
            />
            <div className="flex flex-col items-start">
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row items-center space-x-4">
                        <div className="flex flex-row items-center justify-center w-10 h-10 rounded-full">
                            <AccountIcon
                                className="w-10 h-10"
                                fill={getAccountColor(account.address)}
                            />
                        </div>
                        <div className="flex flex-col space-y-1 cursor-default">
                            <span className="text-sm font-bold text-gray-800">
                                {account.name} (...{account.address.slice(-4)})
                            </span>
                            <span className="text-xs text-gray-400">
                                {formatNumberLength(
                                    formatUnits(nativeToken.balance || "0"),
                                    10
                                )}{" "}
                                {networkNativeCurrency.symbol}
                            </span>
                        </div>
                    </div>
                    <div className="relative" ref={ref}>
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
                        <div
                            className={classnames(
                                "absolute shadow-md bg-white right-0 select-none rounded-md z-10 font-semibold",
                                showOptions ? "" : "hidden"
                            )}
                        >
                            {connected ? (
                                <div
                                    onClick={() => {
                                        setHasDialog(true)
                                    }}
                                    className="text-red-500 cursor-pointer flex flex-row justify-center p-2 items-center hover:bg-gray-100"
                                >
                                    <div className="pl-1 pr-1">
                                        <TrashBinIcon fill="red" />
                                    </div>
                                    <span>Disconnect</span>
                                </div>
                            ) : (
                                <div
                                    onClick={() => {
                                        handleConnectSite(account.address)
                                        setShowOptions(!showOptions)
                                    }}
                                    className="text-green-400 cursor-pointer flex flex-row justify-start p-2 items-center hover:bg-gray-100"
                                >
                                    <div className="">
                                        <BiRadioCircleMarked size={24} />
                                    </div>
                                    <span>Connect</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {connected ? (
                    <div className="flex flex-row">
                        {active && (
                            <div className="mt-2 ml-14 px-1.5 py-0.5 font-bold border rounded-sm text-xs border-gray-700 bg-gray-700 text-white pointer-events-none">
                                Active
                            </div>
                        )}
                        {account.address !== selectedAddress && (
                            <button
                                className={classnames(
                                    "mt-2 px-1.5 py-0.5 font-bold border rounded-sm text-xs border-primary-300 text-primary-300 hover:bg-primary-200",
                                    active ? "ml-2" : "ml-14"
                                )}
                                onClick={() =>
                                    handleSwitchAccount(account.address)
                                }
                            >
                                Switch
                            </button>
                        )}
                    </div>
                ) : (
                    <span
                        className={classnames(
                            "mt-2 ml-14 px-1.5 py-0.5 border rounded-sm text-xs",
                            "border-red-300  text-red-300 pointer-events-none"
                        )}
                    >
                        Not connected
                    </span>
                )}
            </div>
        </>
    )
}

const ConnectedSiteAccountsPage = () => {
    const { accounts, selectedAddress, permissions } = useBlankState()!
    const { origin, fromRoot } =
        useOnMountLocation<ConnectedSiteAccountsLocationState>().state || {}
    const history = useOnMountHistory()
    const permission = permissions[origin]
    const site = permission?.data
    const activeAcc = permission?.activeAccount

    const connectedAccounts = useMemo(() => {
        return permission?.accounts.filter((a) => a !== selectedAddress)
    }, [permission?.accounts, selectedAddress])

    const isSelectedAccountConnected = useMemo(() => {
        return permission?.accounts.some((a) => a === selectedAddress)
    }, [permission?.accounts, selectedAddress])

    const handleRemoveFromSite = async (address: string) => {
        try {
            await removeAccountFromSite(origin, address)
            if (!permission) {
                history.push({
                    pathname: "/",
                })
            }
        } catch {}
    }

    const handleConnectSite = async (address: string) => {
        try {
            connectedAccounts.push(address)
            updateSitePermissions(origin, connectedAccounts)
        } catch {}
    }

    const handleSwitchAccount = async (address: string) => {
        try {
            await selectAccount(address)
            history.push({
                pathname: "/",
            })
        } catch {}
    }

    return !permission ? (
        <Redirect to="/" />
    ) : (
        <PopupLayout
            header={
                <PopupHeader
                    icon={site.iconURL}
                    title={new URL(origin).hostname}
                ></PopupHeader>
            }
        >
            <div className="flex flex-col p-6 space-y-8 text-sm text-gray-500">
                {!isSelectedAccountConnected && (
                    <div>
                        <WarningTip
                            text={"Current account is not connected"}
                            fontSize="text-xs"
                            justify="justify-start"
                        />
                    </div>
                )}
                <div className="flex flex-col space-y-4">
                    <span className="text-xs">CURRENT ACCOUNT</span>
                    <ConnectedSiteAccount
                        account={accounts[selectedAddress]}
                        active={activeAcc === selectedAddress}
                        connected={isSelectedAccountConnected}
                        handleRemoveFromSite={handleRemoveFromSite}
                        handleConnectSite={handleConnectSite}
                        handleSwitchAccount={handleSwitchAccount}
                    />
                </div>

                {connectedAccounts?.length > 0 && (
                    <div className="flex flex-col space-y-4">
                        <span className="text-xs">CONNECTED ACCOUNTS</span>
                        <div className="flex flex-col space-y-6">
                            {connectedAccounts.map(
                                (address) =>
                                    accounts[address] && (
                                        <ConnectedSiteAccount
                                            account={accounts[address]}
                                            active={activeAcc === address}
                                            key={address}
                                            handleRemoveFromSite={
                                                handleRemoveFromSite
                                            }
                                            handleConnectSite={
                                                handleConnectSite
                                            }
                                            handleSwitchAccount={
                                                handleSwitchAccount
                                            }
                                        />
                                    )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PopupLayout>
    )
}

export default ConnectedSiteAccountsPage
