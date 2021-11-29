import { Network } from "@blank/background/utils/constants/networks";

export const isFeatureEnabled = (network: Network, feature: string): boolean => {
    return network.features.some(f => f === feature);
}