import { useBlankState } from '../background/backgroundHooks';

export const useSelectedNetwork = () => {
    const { availableNetworks, selectedNetwork } = useBlankState()!;

    const network = availableNetworks[selectedNetwork.toUpperCase()];

    return network;
};
