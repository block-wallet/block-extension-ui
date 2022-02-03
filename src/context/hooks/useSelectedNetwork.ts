import { useBlankState } from "../background/backgroundHooks"
import ETH_LOGO from "../../assets/images/icons/ETH.svg"

export const useSelectedNetwork = () => {
    const {
        availableNetworks,
        selectedNetwork,
        isEIP1559Compatible,
    } = useBlankState()!

    const network = availableNetworks[selectedNetwork.toUpperCase()]
    const defaultNetworkLogo = network.iconUrls ? network.iconUrls[0] : ETH_LOGO
    return {
        ...network,
        defaultNetworkLogo,
        isEIP1559Compatible: isEIP1559Compatible[network.chainId] || false,
    }
}
