import { useBlankState } from "../background/backgroundHooks"

export const useSelectedNetwork = () => {
    const {
        availableNetworks,
        selectedNetwork,
        isEIP1559Compatible,
    } = useBlankState()!

    const network = availableNetworks[selectedNetwork.toUpperCase()]

    return {
        ...network,
        isEIP1559Compatible: isEIP1559Compatible[network.chainId] || false,
    }
}
