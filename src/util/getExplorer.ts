import { Networks } from "@blank/background/utils/constants/networks"
import { createExplorerLink, createAccountLink } from "@metamask/etherscan-link"
import { capitalize } from "./capitalize"

export const getChainIdFromNetwork = (networks: Networks, network?: String) => {
    if (!network) {
        return undefined
    }

    return Object.values(networks).find((i) => i.name === network)?.chainId
}

/**
 * Util to return a formatted network name from a given chain id
 *
 * @param chainId - Chain id hex string
 * @returns Chain name or 'Unknown'
 */
export const getNetworkFromChainId = (
    networks: Networks,
    chainId: number,
    nameOrDesc: "name" | "desc" = "name"
): string => {
    const network = Object.values(networks).find((i) => i.chainId === chainId)

    const networkName = network !== undefined ? network[nameOrDesc] : undefined

    if (networkName) {
        return capitalize(networkName)
    } else {
        return "Unknown"
    }
}

export const generateExplorerLink = (
    networks: Networks,
    network: string,
    value: string,
    type: "tx" | "address"
) => {
    const chainId = String(getChainIdFromNetwork(networks, network))

    if (type === "tx") {
        return createExplorerLink(value, chainId)
    } else if (type === "address") {
        return createAccountLink(value, chainId)
    }
}

export const getExplorerName = (networks: Networks, network: string) => {
    if (
        network === networks.BSC.name ||
        network === networks.BSC_TESTNET.name
    ) {
        return "Bscscan"
    } else if (network === networks.ARBITRUM.name) {
        return "Arbiscan"
    } else {
        return "Etherscan"
    }
}
