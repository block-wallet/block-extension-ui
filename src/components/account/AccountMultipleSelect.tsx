import React, { FunctionComponent } from "react"
import AccountDisplay from "../account/AccountDisplay"
import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import { Classes, classnames } from "../../styles"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"

const AccountMultipleSelect: FunctionComponent<{
    accounts: AccountInfo[]
    selectedAccount: AccountInfo
    value: AccountInfo[]
    onChange: (value: AccountInfo[]) => void
}> = ({ accounts, selectedAccount, value, onChange }) => {
    const toggleAccount = (account: AccountInfo) => {
        const newValue = value.some((a) => a.address === account.address)
            ? value.filter((a) => a.address !== account.address)
            : [...value, account]
        onChange(newValue)
    }
    const { nativeCurrency } = useSelectedNetwork()
    return (
        <div className="flex flex-col space-y-3 text-sm text-gray-500">
            {accounts.map((account, i) => (
                <div
                    className="flex flex-row items-center space-x-3 cursor-pointer rounded-md hover:bg-primary-100 pl-2"
                    key={i}
                    onClick={() => toggleAccount(account)}
                >
                    <input
                        type="checkbox"
                        className={classnames(Classes.checkboxAlt)}
                        checked={value.some(
                            (a) => a.address === account.address
                        )}
                        onChange={() => toggleAccount(account)}
                    />
                    <AccountDisplay
                        networkNativeCurrency={nativeCurrency}
                        account={account}
                        selected={false}
                    />
                </div>
            ))}
        </div>
    )
}

export default AccountMultipleSelect
