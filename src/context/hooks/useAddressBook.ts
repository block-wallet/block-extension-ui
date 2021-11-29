import { useSelectedNetwork } from './useSelectedNetwork';
import { useBlankState } from '../background/backgroundHooks';
import { NetworkAddressBook } from '@blank/background/controllers/AddressBookController';

export const useAddressBook = () => {
    const { name } = useSelectedNetwork();
    const { addressBook } = useBlankState()!;

    if (!addressBook) {
        return {} as NetworkAddressBook;
    }

    return addressBook[name.toUpperCase()] || ({} as NetworkAddressBook);
};

export const useAddressBookRecentAddresses = () => {
    const { name } = useSelectedNetwork();
    const { recentAddresses } = useBlankState()!;

    if (!recentAddresses) {
        return {} as NetworkAddressBook;
    }

    return recentAddresses[name.toUpperCase()] || ({} as NetworkAddressBook);
};
