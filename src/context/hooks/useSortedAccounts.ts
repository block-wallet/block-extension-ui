import { AccountInfo } from '@blank/background/controllers/AccountTrackerController';
import { useMemo } from 'react';
import { useBlankState } from '../background/backgroundHooks';

export const useSortedAccounts = (): AccountInfo[] => {
    const { accounts } = useBlankState()!

    return useMemo(() => Object.values(accounts).sort(accountSort), [accounts])
}

const accountSort = (a: AccountInfo, b: AccountInfo) => {
    return (a.index > b.index) ? 1 : -1;
}
