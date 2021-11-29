import { GasPriceData } from "@blank/background/controllers/GasPricesController"
import { useBlankState } from "../background/backgroundHooks"
import { useSelectedNetwork } from "./useSelectedNetwork"

export const useGasPriceData = () => {
    const { gasPriceData } = useBlankState()!
    const { chainId } = useSelectedNetwork()

    if (chainId in gasPriceData) {
        return gasPriceData[chainId]
    }

    return {
        gasPrices: { slow: {}, average: {}, fast: {} },
    } as GasPriceData
}
