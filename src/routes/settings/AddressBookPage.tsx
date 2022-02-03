import React, { FunctionComponent } from "react"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import AccountDisplay from "../../components/account/AccountDisplay"
import VerticalSelect from "../../components/input/VerticalSelect"
import PopupFooter from "../../components/popup/PopupFooter"
import { AccountInfo } from "../../../../background/src/controllers/AccountTrackerController"
import { addressBookDelete } from "../../context/commActions"
import {
    useAddressBook,
    useAddressBookRecentAddresses,
} from "../../context/hooks/useAddressBook"
import { AddressBookEntry } from "@blank/background/controllers/AddressBookController"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"

const AddressBookPage: FunctionComponent<{
    addresses: AccountInfo[]
}> = () => {
    const history: any = useOnMountHistory()
    const addressBook = useAddressBook()
    const recentAddresses = useAddressBookRecentAddresses()
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
        <PopupLayout
            header={<PopupHeader title="Address Book" />}
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        label="New Contact"
                        onClick={() => {
                            history.push({
                                pathname: "/settings/addressBook/add",
                                state: {
                                    editMode: false,
                                    contact: null,
                                },
                            })
                        }}
                    />
                </PopupFooter>
            }
        >
            <div className="flex flex-col p-6 space-y-8 text-sm text-gray-500">
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
                        <span className="text-xs">RECENT CONTACTS</span>
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
