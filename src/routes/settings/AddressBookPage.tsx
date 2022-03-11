import React, { FunctionComponent } from "react"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import AccountDisplay from "../../components/account/AccountDisplay"
import VerticalSelect from "../../components/input/VerticalSelect"
import { AccountInfo } from "../../../../background/src/controllers/AccountTrackerController"
import { addressBookDelete } from "../../context/commActions"
import {
    useAddressBook,
    useAddressBookRecentAddresses,
} from "../../context/hooks/useAddressBook"
import { AddressBookEntry } from "@blank/background/controllers/AddressBookController"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { ActionButton } from "../../components/button/ActionButton"
import accountAdd from "../../assets/images/icons/account_add.svg"
import { useHistory } from "react-router-dom"
import plusIcon from "../../assets/images/icons/plus.svg"

const AddressBookPage: FunctionComponent<{
    addresses: AccountInfo[]
}> = () => {
    const history = useHistory()
    const addressBook = useAddressBook()
    const recentAddresses = useAddressBookRecentAddresses({
        filterContacts: true,
    })
    const { nativeCurrency } = useSelectedNetwork()
    //  const [error, setError] = useState('')

    const removeContact = async (address: string) => {
        try {
            await addressBookDelete(address)
        } catch {
            // TODO: show error
            //  setError(error.message)
        }
    }

    return (
        <PopupLayout header={<PopupHeader title="Address Book" />}>
            <div className="flex flex-col p-6 space-y-5 text-sm text-gray-500">
                <ActionButton
                    icon={accountAdd}
                    label="Create New Contact"
                    to="/settings/addressBook/add"
                    state={{ editMode: false, contact: null }}
                />
                {Object.keys(addressBook).length !== 0 && (
                    <div className="flex flex-col space-y-4">
                        <span className="text-xs">CURRENT CONTACTS</span>
                        <VerticalSelect
                            containerClassName="flex flex-col space-y-4"
                            options={Object.values(addressBook)}
                            value={Object.values(addressBook)[0]}
                            onChange={() => {}}
                            disableStyles
                            display={(entry: AddressBookEntry) => (
                                <AccountDisplay
                                    networkNativeCurrency={nativeCurrency}
                                    account={
                                        {
                                            address: entry.address,
                                            name: entry.name,
                                        } as AccountInfo
                                    }
                                    selected={false}
                                    showAddress={true}
                                    withOptions={true}
                                    canCopy={true}
                                    handleRemoveContact={(address: string) =>
                                        removeContact(address)
                                    }
                                />
                            )}
                        />
                    </div>
                )}
                {Object.keys(recentAddresses).length !== 0 && (
                    <div className="flex flex-col space-y-4">
                        <span className="text-xs">RECENT ADDRESSES</span>
                        <VerticalSelect
                            containerClassName="flex flex-col space-y-4"
                            options={Object.values(recentAddresses)}
                            value={Object.values(recentAddresses)[0]}
                            onChange={() => {}}
                            disableStyles
                            display={(entry: AddressBookEntry) => (
                                <AccountDisplay
                                    networkNativeCurrency={nativeCurrency}
                                    account={
                                        {
                                            address: entry.address,
                                            name: entry.name,
                                        } as AccountInfo
                                    }
                                    selected={false}
                                    showAddress={true}
                                    canCopy={true}
                                    withOptions
                                    customOptions={
                                        <div
                                            className="flex flex-row justify-start items-center p-2 cursor-pointer text-black hover:bg-gray-100 hover:rounded-t-md"
                                            onClick={() =>
                                                history.push({
                                                    pathname:
                                                        "/settings/addressBook/add",
                                                    state: {
                                                        contact: {
                                                            address:
                                                                entry.address,
                                                        },
                                                    },
                                                })
                                            }
                                        >
                                            <div className="pl-2 pr-3">
                                                <img
                                                    src={plusIcon}
                                                    alt="Add Contact"
                                                ></img>
                                            </div>
                                            <span>Add Contact</span>
                                        </div>
                                    }
                                />
                            )}
                        />
                    </div>
                )}
                {!Object.keys(addressBook).length &&
                    !Object.keys(recentAddresses).length && (
                        <span className="text-sm text-gray-500">
                            No contacts.
                        </span>
                    )}
            </div>
        </PopupLayout>
    )
}

export default AddressBookPage
