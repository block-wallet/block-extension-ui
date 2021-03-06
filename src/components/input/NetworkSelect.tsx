import React, { FunctionComponent, useRef, useState } from "react"
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri"
import { BsCheck } from "react-icons/bs"
import { useBlankState } from "../../context/background/backgroundHooks"
import classnames from "classnames"
import { useOnClickOutside } from "../../util/useOnClickOutside"
import { changeNetwork, setShowTestNetworks } from "../../context/commActions"
import LoadingOverlay from "../loading/LoadingOverlay"
import { Network } from "@blank/background/utils/constants/networks"
import classNames from "classnames"

const sortFunc = (a: Network, b: Network) => {
    return a.order - b.order
}

const NetworkOption: FunctionComponent<{
    option: Network
    selectedNetwork: string
    handleNetworkChange: (option: any) => Promise<void>
    disabled?: boolean
}> = ({ option, selectedNetwork, handleNetworkChange, disabled = false }) => (
    <li
        className={classnames(
            "cursor-pointer flex flex-row justify-between pl-2 pr-2 pt-1 pb-1 items-center hover:bg-gray-100",
            !option.enable && "bg-gray-200 pointer-events-none",
            disabled && "opacity-50 pointer-events-none",
            option.name === selectedNetwork && "pointer-events-none"
        )}
        onClick={async () => await handleNetworkChange(option.name)}
    >
        <span
            className={classnames(
                "leading-loose",
                selectedNetwork === option.name && "font-bold"
            )}
        >
            {option.desc}
        </span>
        {selectedNetwork === option.name && <BsCheck size={16} />}
    </li>
)

const NetworkSelect: FunctionComponent<{
    className?: string
    optionsContainerClassName?: string
}> = ({ className, optionsContainerClassName }) => {
    const [networkList, setNetworkList] = useState(false)
    const [networkChanging, setNetworkChanging] = useState(false)
    const {
        selectedNetwork,
        availableNetworks,
        showTestNetworks,
        isAccountTrackerLoading,
        isNetworkChanging,
        isImportingDeposits,
        isUserNetworkOnline,
    } = useBlankState()!
    const ref = useRef(null)
    useOnClickOutside(ref, () => setNetworkList(false))

    const handleNetworkChange = async (network: string) => {
        setNetworkChanging(true)
        setNetworkList(false)
        await changeNetwork(network)
        setNetworkChanging(false)
    }

    const getNetworkDesc = (): string => {
        const networkName = selectedNetwork.toUpperCase()
        return availableNetworks[networkName].desc
    }

    return (
        <div className={`relative ${className}`} ref={ref} role="menu" data-testid="network-selector">
            {(networkChanging ||
                isAccountTrackerLoading ||
                isNetworkChanging) && <LoadingOverlay />}
            <div
                onClick={() => {
                    if (!isImportingDeposits) {
                        setNetworkList(!networkList)
                    }
                }}
                className={classNames(
                    "relative flex flex-row justify-between items-center p-1 px-2 pr-1 text-gray-600 border rounded-md group border-primary-200 w-40 text-xs hover:border-primary-300",
                    !isImportingDeposits
                        ? "cursor-pointer select-none"
                        : "disabled:pointer-events-none opacity-50",
                    networkList && "border-primary-300"
                )}
            >
                <span data-testid="selected-network" className="select-none">{getNetworkDesc()}</span>
                {networkList ? (
                    <RiArrowUpSLine size={16} />
                ) : (
                    <RiArrowDownSLine size={16} />
                )}
            </div>

            <div
                hidden={!networkList}
                className={`absolute shadow-md rounded-md w-48 mt-2 bg-white z-50 select-none ${optionsContainerClassName}`}
            >
                <ul className="text-xs">
                    {Object.values(availableNetworks)
                        .filter((n) => n.enable && !n.test)
                        .sort(sortFunc)
                        .map((option) => (
                            <NetworkOption
                                key={option.chainId}
                                option={option}
                                selectedNetwork={selectedNetwork}
                                handleNetworkChange={handleNetworkChange}
                                disabled={!isUserNetworkOnline}
                            />
                        ))}
                    <li
                        key="test"
                        className="cursor-pointer flex flex-row justify-between pl-2 pr-2 pt-1 pb-1 items-center border-t border-t-gray-200 border-b border-b-gray-200 hover:bg-gray-100"
                        onClick={() => setShowTestNetworks(!showTestNetworks)}
                    >
                        <label
                            className="leading-loose text-gray-500 cursor-pointer"
                            htmlFor="showTestNetworks"
                        >
                            Show Test Networks
                        </label>
                        <input
                            id="showTestNetworks"
                            type="checkbox"
                            className="border-2 border-gray-200 rounded-md focus:ring-0 cursor-pointer"
                            checked={showTestNetworks}
                            onChange={() => {}}
                        />
                    </li>
                    {showTestNetworks &&
                        Object.values(availableNetworks)
                            .filter((n) => n.enable && n.test)
                            .sort(sortFunc)
                            .map((option) => (
                                <NetworkOption
                                    key={option.chainId}
                                    option={option}
                                    selectedNetwork={selectedNetwork}
                                    handleNetworkChange={handleNetworkChange}
                                    disabled={
                                        !isUserNetworkOnline &&
                                        !option.name
                                            .toLowerCase()
                                            .includes("localhost")
                                    }
                                />
                            ))}
                </ul>
            </div>
        </div>
    )
}

export default NetworkSelect
