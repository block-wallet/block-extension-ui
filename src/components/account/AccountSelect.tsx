import React, { FunctionComponent, useState, useMemo } from "react"
import AccountDisplay from "../account/AccountDisplay"
import VerticalSelect from "../input/VerticalSelect"
import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import AccountSearchBar from "./AccountSearchBar"
import { filterAccounts } from "../../util/filterAccounts"
import { useBlankState } from "../../context/background/backgroundHooks"
import { session } from "../../context/setup"

const AccountSelect: FunctionComponent<{
    accounts: AccountInfo[]
    selectedAccount: AccountInfo
    showSelectedCheckmark?: boolean
    showDefaultLabel?: boolean
    onAccountChange: any
    createAccountTo?: any
}> = ({
    accounts,
    selectedAccount,
    showSelectedCheckmark = true,
    showDefaultLabel,
    onAccountChange,
    createAccountTo = { pathname: "/accounts/create" },
}) => {
    const { permissions } = useBlankState()!
    const currentAccount = useSelectedAccount()
    const otherAccounts = accounts.filter(
        (account) => account.address !== currentAccount.address
    )
    const { nativeCurrency } = useSelectedNetwork()

    const origin = session?.origin
    const permission = origin ? permissions[origin] : undefined
    const connectedAccounts = permission?.accounts ?? []

    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [filteredAccounts, setFilteredAccounts] = useState<AccountInfo[]>([])

    const onFilterChange = (value: string) => {
        setShowResults(value !== "")
        if (value) {
            // Filter accounts by name or address lowercase
            setFilteredAccounts(filterAccounts(accounts, value.toLowerCase()))
        }
    }

    return (
        <div className="flex flex-col p-6 space-y-5 text-sm text-gray-500">
            <AccountSearchBar
                onChange={onFilterChange}
                createAccountTo={createAccountTo}
                setIsSearching={(searching) => {
                    setIsSearching(searching)
                    if (!searching) setShowResults(false)
                }}
            />
            {!isSearching || !showResults ? (
                <>
                    <div className="flex flex-col space-y-4">
                        <span className="text-xs">CURRENT ACCOUNT</span>

                        <div
                            onClick={() => {
                                if (
                                    selectedAccount.address !==
                                        currentAccount.address &&
                                    onAccountChange
                                )
                                    onAccountChange(currentAccount)
                            }}
                        >
                            <AccountDisplay
                                networkNativeCurrency={nativeCurrency}
                                account={currentAccount}
                                defaultAccount={showDefaultLabel}
                                showAccountDetailsIcon={!showDefaultLabel}
                                selected={
                                    selectedAccount.address ===
                                    currentAccount.address
                                }
                                showSelectedCheckmark={showSelectedCheckmark}
                                showConnected={connectedAccounts.includes(
                                    currentAccount.address
                                )}
                            />
                        </div>
                    </div>
                    {otherAccounts.length > 0 && (
                        <div className="flex flex-col space-y-4">
                            <span className="text-xs">OTHER ACCOUNTS</span>
                            <VerticalSelect
                                containerClassName="flex flex-col space-y-3"
                                options={otherAccounts}
                                value={selectedAccount}
                                onChange={onAccountChange}
                                disableStyles
                                display={(account, i) => (
                                    <AccountDisplay
                                        networkNativeCurrency={nativeCurrency}
                                        account={account}
                                        selected={
                                            selectedAccount.address ===
                                            account.address
                                        }
                                        showConnected={connectedAccounts.includes(
                                            account.address
                                        )}
                                    />
                                )}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col space-y-4">
                    <span className="text-xs">SEARCH RESULTS</span>
                    <VerticalSelect
                        containerClassName="flex flex-col space-y-6"
                        options={filteredAccounts}
                        value={selectedAccount}
                        onChange={onAccountChange}
                        disableStyles
                        display={(account, i) => (
                            <AccountDisplay
                                networkNativeCurrency={nativeCurrency}
                                account={account}
                                selected={
                                    selectedAccount.address === account.address
                                }
                                showConnected={connectedAccounts.includes(
                                    account.address
                                )}
                            />
                        )}
                    />
                </div>
            )}
        </div>
    )
}

export default AccountSelect
