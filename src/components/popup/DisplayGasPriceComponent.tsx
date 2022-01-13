import React, { FunctionComponent, useState } from "react"
import { utils, BigNumber } from "ethers"

import { GasPriceLevels } from "@blank/background/controllers/GasPricesController"
import Dialog from "../dialog/Dialog"

// icons
import CloseIcon from "../icons/CloseIcon"
import GasIcon from "../icons/GasIcon"
import Tooltip from "../label/Tooltip"
import { AiFillInfoCircle } from "react-icons/ai"

// hooks
import { useGasPriceData } from "../../context/hooks/useGasPriceData"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"

const gasToGweiString = (gas: BigNumber | null) => {
    if (!gas) return ""

    const gasInGwei = utils.formatUnits(gas, "gwei")

    if (Number(gasInGwei) > 1) {
        return String(Math.round(Number(gasInGwei)))
    } else if (Number(gasInGwei) > 0.1) {
        return String(Math.round(Number(gasInGwei) * 10) / 10)
    } else if (Number(gasInGwei) > 0) {
        return "<0.1"
    } else {
        return ""
    }
}

const getDisplayGasPrice = (
    isEIP1559Compatible: boolean,
    gasPrices: GasPriceLevels
): string => {
    let gasPrice: BigNumber | null = null

    if (gasPrices) {
        if (isEIP1559Compatible) {
            gasPrice = gasPrices.average?.maxFeePerGas
        } else {
            gasPrice = gasPrices.average?.gasPrice
        }
    }

    return gasToGweiString(gasPrice)
}

const getDisplayGasPrices = (
    isEIP1559Compatible: boolean,
    gasPrices: GasPriceLevels
): { low: string; medium: string; fast: string } | undefined => {
    let displayGasPrices: { low: string; medium: string; fast: string }

    if (gasPrices) {
        if (isEIP1559Compatible) {
            displayGasPrices = {
                low: gasToGweiString(gasPrices.slow?.maxFeePerGas),
                medium: gasToGweiString(gasPrices.average?.maxFeePerGas),
                fast: gasToGweiString(gasPrices.fast?.maxFeePerGas),
            }
        } else {
            displayGasPrices = {
                low: gasToGweiString(gasPrices.slow?.gasPrice),
                medium: gasToGweiString(gasPrices.average?.gasPrice),
                fast: gasToGweiString(gasPrices.fast?.gasPrice),
            }
        }

        return displayGasPrices
    }

    return undefined
}

const DisplayGasPriceComponent: FunctionComponent<{}> = () => {
    const [active, setActive] = useState(false)

    const { showGasLevels, isEIP1559Compatible } = useSelectedNetwork()
    const { gasPricesLevels } = useGasPriceData()

    const displayGasPrices = getDisplayGasPrices(
        !!isEIP1559Compatible,
        gasPricesLevels
    )
    const displayGasPrice = getDisplayGasPrice(
        !!isEIP1559Compatible,
        gasPricesLevels
    )

    if (!displayGasPrice || !displayGasPrices) return null

    return (
        <>
            {/* Label */}
            <div
                className={`flex flex-row items-center space-x-1 ${
                    showGasLevels
                        ? "transition duration-300 hover:text-primary-300  cursor-pointer"
                        : ""
                }`}
                onClick={() => {
                    if (showGasLevels) setActive(!active)
                }}
            >
                <span className="text-sm font-bold">{displayGasPrice}</span>
                <GasIcon />
            </div>

            {/* Modal */}
            <div style={undefined}>
                <Dialog open={active} onClickOutside={() => setActive(false)}>
                    <span className="absolute top-0 right-0 p-4 z-50">
                        <div
                            onClick={() => setActive(false)}
                            className=" cursor-pointer p-2 ml-auto -mr-2 text-gray-900 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300"
                        >
                            <CloseIcon size="10" />
                        </div>
                    </span>
                    <div className="flex flex-col w-full space-y-2">
                        <div className="z-10 flex flex-row items-center p-2 bg-white bg-opacity-75">
                            <h2 className="px-2 pr-0 text-lg font-bold">
                                Gas Prices
                            </h2>
                            <div className="group relative">
                                <a
                                    href="https://ethereum.org/en/developers/docs/gas/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <AiFillInfoCircle
                                        size={26}
                                        className="pl-2 text-primary-200 cursor-pointer hover:text-primary-300"
                                    />
                                </a>
                                <Tooltip
                                    content={
                                        <div className="flex flex-col font-normal items-start text-xs text-white-500">
                                            <div className="flex flex-row items-end space-x-7">
                                                <span>
                                                    Gas is used to operate on
                                                    the network.
                                                </span>{" "}
                                            </div>
                                            <div className="flex flex-row items-end space-x-4">
                                                <span>
                                                    Click on this icon to learn
                                                    more.
                                                </span>{" "}
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-col px-4 space-y-4">
                                <div className="flex flex-col space-y-1">
                                    <div className="font-bold text-base">
                                        Low
                                    </div>
                                    <div className="items-center text-xs">
                                        {displayGasPrices.low} GWEI
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <div className="font-bold text-base">
                                        Medium
                                    </div>
                                    <div className="text-xs">
                                        {displayGasPrices.medium} GWEI
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <div className="font-bold text-base">
                                        Fast
                                    </div>
                                    <div className="text-xs">
                                        {displayGasPrices.fast} GWEI
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    )
}

export default DisplayGasPriceComponent
