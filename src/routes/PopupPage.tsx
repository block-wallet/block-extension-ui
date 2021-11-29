import React, { useState } from "react"
import PageLayout from "../components/PageLayout"

import classnames from "classnames"
import { Link, useHistory } from "react-router-dom"

import CopyTooltip from "../components/label/СopyToClipboardTooltip"

import { formatHash, formatName } from "../util/formatAccount"
import { useBlankState } from "../context/background/backgroundHooks"
import { formatUnits } from "ethers/lib/utils"
import { BigNumber } from "ethers"
import { formatCurrency, toCurrencyAmount } from "../util/formatCurrency"
import { BiCircle } from "react-icons/bi"
import { useSelectedAccount } from "../context/hooks/useSelectedAccount"
import GearIcon from "../components/icons/GearIcon"
import NetworkSelect from "../components/input/NetworkSelect"
import ArrowHoverAnimation from "../components/icons/ArrowHoverAnimation"
import AccountIcon from "../components/icons/AccountIcon"
import { getAccountColor } from "../util/getAccountColor"
import { useSelectedNetwork } from "../context/hooks/useSelectedNetwork"
import { isFeatureEnabled } from "../context/util/isFeatureEnabled"
import { session } from "../context/commActions"
import ActivityAssetsView from "../components/ActivityAssetsView"

import { useConnectedSite } from "../context/hooks/useConnectedSite"
import { formatRounded } from "../util/formatRounded"
import { HiOutlineExclamationCircle } from "react-icons/hi"
import eye from "../assets/images/icons/eye.svg"
import { useTokensList } from "../context/hooks/useTokensList"
import GenericTooltip from "../components/label/GenericTooltip"

const AccountDisplay = () => {
    const blankState = useBlankState()!
    const accountAddress = blankState.selectedAddress
    const account = useSelectedAccount()
    const [copied, setCopied] = useState(false)
    const copy = async () => {
        await navigator.clipboard.writeText(accountAddress)
        setCopied(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setCopied(false)
    }
    return (
        <button
            type="button"
            className="relative flex flex-col group"
            onClick={copy}
        >
            <span className="text-sm font-bold">
                {formatName(account.name, 24)}
            </span>
            <span className="text-xs text-gray-600 truncate">
                {formatHash(accountAddress)}
            </span>
            <CopyTooltip copied={copied} />
        </button>
    )
}

const DAppConnection = () => {
    const dAppConnected = useConnectedSite()
    const history = useHistory()!
    return (
        <div
            onClick={() => {
                if (dAppConnected !== "not-connected") {
                    history.push({
                        pathname: "/accounts/menu/connectedSites/accountList",
                        state: {
                            origin: session?.origin,
                            fromRoot: true,
                        },
                    })
                }
            }}
            className={classnames(
                "relative flex flex-row items-center p-1 px-2 pr-1  text-gray-600 rounded-md group border border-primary-200  text-xs cursor-pointer",
                dAppConnected === "connected" &&
                    "bg-green-100 hover:border-green-300",
                dAppConnected === "connected-warning" &&
                    "bg-yellow-100 hover:border-yellow-300",
                dAppConnected === "not-connected" && "pointer-events-none"
            )}
        >
            {dAppConnected === "connected" && (
                <span className="relative inline-flex rounded-full h-2 w-2 mr-2 animate-pulse bg-green-400 pointer-events-none"></span>
            )}

            {dAppConnected === "connected-warning" && (
                <HiOutlineExclamationCircle
                    size={16}
                    className="mr-1 text-yellow-600"
                />
            )}

            {dAppConnected === "not-connected" && (
                <BiCircle className="mr-1 w-2" />
            )}

            <span
                className={classnames(
                    "mr-1 pointer-events-none",
                    dAppConnected === "connected" && "text-green-600",
                    dAppConnected === "connected-warning" && "text-yellow-600"
                )}
            >
                {dAppConnected === "not-connected"
                    ? "Not connected"
                    : "Connected"}
            </span>
        </div>
    )
}

const PopupPage = () => {
    const state = useBlankState()!
    const account = useSelectedAccount()
    const { nativeToken } = useTokensList()
    const network = useSelectedNetwork()
    const tornadoEnabled = isFeatureEnabled(network, "tornado")
    const sendsEnabled = isFeatureEnabled(network, "sends")

    return (
        <PageLayout screen className="max-h-screen">
            <div
                className="absolute top-0 left-0 z-10 flex flex-col items-start w-full p-6 bg-white bg-opacity-75 border-b border-b-gray-200"
                style={{ backdropFilter: "blur(4px)" }}
            >
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row items-center space-x-3">
                        <Link
                            to="/accounts"
                            className="transition duration-300"
                        >
                            <AccountIcon
                                className="w-8 h-8 transition-transform duration-200 ease-in transform hover:rotate-180"
                                fill={getAccountColor(account?.address)}
                            />
                        </Link>
                        <AccountDisplay />
                    </div>
                    <div className="flex flex-row items-center -mr-1 space-x-2">
                        <Link
                            to="/settings"
                            className="p-2 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300"
                        >
                            <GearIcon />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-start flex-1 w-full h-0 max-h-screen p-6 pt-24 space-y-2 overflow-auto">
                <div className="flex flex-row items-start w-full justify-between pt-1 pb-2">
                    <GenericTooltip
                        bottom
                        disabled={!state.isImportingDeposits}
                        content={
                            <p className="w-40 text-center">
                                Please wait until deposits are done loading to
                                change networks.
                            </p>
                        }
                    >
                        <NetworkSelect />
                    </GenericTooltip>
                    <DAppConnection />
                </div>
                <div
                    className="flex flex-col items-center w-full h-40 p-4 justify-between rounded-md bg-primary-100"
                    style={{ minHeight: "10rem" }}
                >
                    <div className="flex flex-col items-center space-y-1">
                        <span
                            className="text-2xl font-bold"
                            title={
                                formatUnits(
                                    nativeToken.balance || "0",
                                    network.nativeCurrency.decimals
                                ) + ` ${network.nativeCurrency.symbol}`
                            }
                        >
                            {formatRounded(
                                formatUnits(
                                    nativeToken.balance || "0",
                                    network.nativeCurrency.decimals
                                ),
                                5
                            )}{" "}
                            {network.nativeCurrency.symbol}
                        </span>
                        <span className="text-sm text-gray-600">
                            {formatCurrency(
                                toCurrencyAmount(
                                    nativeToken.balance || BigNumber.from(0),
                                    state.exchangeRates[
                                        state.networkNativeCurrency.symbol
                                    ],
                                    network.nativeCurrency.decimals
                                ),
                                {
                                    currency: state.nativeCurrency,
                                    locale_info: state.localeInfo,
                                    returnNonBreakingSpace: true,
                                    showSymbol: true,
                                }
                            )}
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-around w-full">
                        <Link
                            to="/send"
                            className={classnames(
                                "flex flex-col items-center space-y-2 group",
                                (!sendsEnabled || !state.isUserNetworkOnline) &&
                                    "pointer-events-none"
                            )}
                        >
                            <div
                                className={classnames(
                                    "w-8 h-8 overflow-hidden transition duration-300 rounded-full group-hover:opacity-75",
                                    !sendsEnabled || !state.isUserNetworkOnline
                                        ? "bg-gray-300"
                                        : "bg-primary-300"
                                )}
                                style={{ transform: "scaleY(-1)" }}
                            >
                                <ArrowHoverAnimation />
                            </div>
                            <span className="text-xs font-medium">Send</span>
                        </Link>
                        {tornadoEnabled && (
                            <Link
                                to="/privacy"
                                className="flex flex-col items-center space-y-2 group"
                            >
                                <div className="w-8 h-8 flex items-center overflow-hidden transition duration-300 rounded-full bg-primary-300 group-hover:opacity-75">
                                    <img
                                        alt="Privacy"
                                        src={eye}
                                        className="w-full h-3"
                                    />
                                </div>
                                <span className="text-xs font-medium">
                                    Privacy
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
                <ActivityAssetsView initialTab={state.popupTab} />
            </div>
        </PageLayout>
    )
}

export default PopupPage
