import React, { FunctionComponent } from "react"
import AccountDisplay from "../account/AccountDisplay"
import VerticalSelect from "../input/VerticalSelect"
import accountAdd from "../../assets/images/icons/account_add.svg"
import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { ActionButton } from "../button/ActionButton"

const AccountSelect: FunctionComponent<{
    accounts: AccountInfo[]
    selectedAccount: AccountInfo
    showDefaultLabel?: boolean
    onAccountChange: any
    createAccountTo?: any
}> = ({
    accounts,
    selectedAccount,
    showDefaultLabel,
    onAccountChange,
    createAccountTo = "/accounts/create",
}) => {
    const currentAccount = useSelectedAccount()
    const otherAccounts = accounts.filter(
        (account) => account.address !== currentAccount.address
    )
    const { nativeCurrency } = useSelectedNetwork()

    return (
        <div className="flex flex-col p-6 space-y-3 text-sm text-gray-500">
            <ActionButton
                icon={accountAdd}
                label="Create New Account"
                to={createAccountTo}
            />
            <div className="flex flex-col space-y-4">
                <span className="text-xs">CURRENT ACCOUNT</span>

                <AccountDisplay
                    networkNativeCurrency={nativeCurrency}
                    account={currentAccount}
                    defaultAccount={showDefaultLabel}
                    showAccountDetailsIcon
                    selected={
                        selectedAccount.address === currentAccount.address
                    }
                />
            </div>
            <div className="flex flex-col space-y-4">
                <span className="text-xs">OTHER ACCOUNTS</span>
                <VerticalSelect
                    containerClassName="flex flex-col space-y-6"
                    options={otherAccounts}
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
                        />
                    )}
                />

                {/*<Link
                    to={createAccountTo}
                    className="flex flex-row items-center justify-start w-full px-4 py-4 mt-4 space-x-2 text-sm font-bold text-black transition duration-300 transform rounded bg-primary-100 active:scale-95 hover:bg-primary-200"
                    rel="noopener noreferrer"
                >
                    <img
                        src={accountAdd}
                        alt="create an account"
                        className="w-5 h-5 mr-1"
                    />
                    <span>Create an Account</span>
                </Link>*/}
            </div>
        </div>
    )
}

export default AccountSelect
