import React from "react"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import VerticalSelect from "../input/VerticalSelect"
import PopupHeader from "../popup/PopupHeader"
import PopupLayout from "../popup/PopupLayout"
import AccountDisplay from "./AccountDisplay"

import exportIcon from "../../assets/images/icons/export.svg"
import openExternal from "../../assets/images/icons/open_external.svg"
import arrowDown from "../../assets/images/icons/circle-arrow-down.svg"
import sites from "../../assets/images/icons/connected_sites.svg"

import { generateExplorerLink, getExplorerName } from "../../util/getExplorer"
import { useBlankState } from "../../context/background/backgroundHooks"
import classnames from "classnames"
import { useOnMountHistory } from "../../context/hooks/useOnMount"

const AccountMenu = () => {
    const { availableNetworks, selectedNetwork } = useBlankState()!
    const account = useSelectedAccount()
    const { nativeCurrency } = useSelectedNetwork()
    const history = useOnMountHistory()

    const explorerName = getExplorerName(availableNetworks, selectedNetwork)
    const options = [
        {
            icon: arrowDown,
            label: "Receive Funds",
            to: "/accounts/menu/receive",
        },
        {
            icon: sites,
            label: "Connected Sites",
            to: "/accounts/menu/connectedSites",
        },
        {
            icon: exportIcon,
            label: "Export Account Data",
            to: "/accounts/menu/export",
        },
        {
            icon: openExternal,
            label: "View on " + explorerName,
            to: generateExplorerLink(
                availableNetworks,
                selectedNetwork,
                account.address,
                "address"
            ),
        },
    ]
    return (
        <PopupLayout
            header={
                <PopupHeader
                    title="Account"
                    close={history.location.state?.from ?? "/accounts"}
                />
            }
        >
            <div className="flex flex-col p-6 space-y-8 text-sm text-gray-500">
                <div className="flex flex-col space-y-4">
                    <AccountDisplay
                        networkNativeCurrency={nativeCurrency}
                        account={account}
                        selected={false}
                        showEditButton
                    />
                </div>
                <div className="flex flex-col space-y-4">
                    <span className="text-xs">ACCOUNT SETTINGS</span>
                    <div className="flex flex-col space-y-1">
                        <VerticalSelect
                            options={options}
                            value={undefined}
                            onChange={(option) =>
                                option.to.includes("https://")
                                    ? chrome.tabs.create({ url: option.to })
                                    : history.push({
                                          pathname: option.to,
                                          state: { from: "/accounts/menu" },
                                      })
                            }
                            containerClassName="flex flex-col space-y-4"
                            display={(option, i) => {
                                const className =
                                    "flex flex-row space-x-3 items-center text-gray-900 h-5"
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
                    </div>
                </div>
            </div>
        </PopupLayout>
    )
}

export default AccountMenu
