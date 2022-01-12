import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"

/**
 * Util to filter an account list by name or address.
 * @param accounts account list to filter
 * @param filter string value to apply
 * @returns filtered account list
 */
export const filterAccounts = (accounts: AccountInfo[], filter: string) => {
    return accounts.filter(
        (account) =>
            account.name.toLowerCase().includes(filter) ||
            account.address.toLowerCase().includes(filter)
    )
}