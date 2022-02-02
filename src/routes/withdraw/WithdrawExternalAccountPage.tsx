import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"

import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import TextInput from "../../components/input/TextInput"
import SearchInput from "../../components/input/SearchInput"

import classnames from "classnames"

import checkmarkMiniIcon from "../../assets/images/icons/checkmark_mini.svg"

import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { InferType } from "yup"
import { utils } from "ethers"
import { searchEns, EnsResult } from "../../util/searchEns"

import { CurrencyAmountPair } from "@blank/background/controllers/blank-deposit/types"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import AddressBookSelect from "../../components/addressBook/AddressBookSelect"
import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import AccountDisplay from "../../components/account/AccountDisplay"

const schema = yup.object().shape({
    address: yup
        .string()
        .required("No address provided.")
        .test("is-correct", "Address is incorrect", (address) => {
            return utils.isAddress(address || "")
        }),
})
type AddressFormData = InferType<typeof schema>

const WithdrawExternalPage = () => {
    const {
        register,
        handleSubmit,
        errors,
        setValue,
    } = useForm<AddressFormData>({
        resolver: yupResolver(schema),
    })
    const history: any = useOnMountHistory()
    const network = useSelectedNetwork()
    const currentAccount = useSelectedAccount()
    const { pair } = history.location.state as { pair: CurrencyAmountPair }

    const [ensEnabled, setEnsEnabled] = useState<boolean>(false)
    const [ensSearch, setEnsSearch] = useState<string>("")
    const [ensResult, setEnsResult] = useState<EnsResult>()
    const [ensSelected, setEnsSelected] = useState<EnsResult>()
    const [isEnsSelected, setIsEnsSelected] = useState<boolean>(false)
    const [warning, setWarning] = useState<string>("")
    const [isAddress, setIsAddress] = useState<boolean>(false)

    useEffect(() => {
        if (network.ens) setEnsEnabled(true)
    }, [network.ens])

    // Functions
    const checkSameAddress = (value: string) => {
        if (value.toLowerCase() === currentAccount.address.toLowerCase()) {
            setWarning("Warning: You are trying to send to your own address.")
        } else setWarning("")
    }

    // Handlers
    const onChangeHandler = async (event: any) => {
        // Bind
        const value = event.target.value
        setEnsSearch(value)

        // Check Address
        setIsAddress(utils.isAddress(value))

        // Warning
        checkSameAddress(value)

        // ENS
        if (ensEnabled) {
            searchEns(value, setEnsSearch, setEnsResult)
        }

        // Yup
        setValue("address", value)
        setIsEnsSelected(false)
    }

    const handleEnsClick = (result: EnsResult) => {
        setEnsSelected(result)
        setIsEnsSelected(!isEnsSelected)

        if (!isEnsSelected) {
            setValue("address", result.address, { shouldValidate: true })
            setIsAddress(true)
            setEnsSearch(result.address)
        } else {
            setValue("address", null)
            setEnsSearch("")
            setEnsResult(undefined)
            setIsAddress(false)
        }
    }

    const onSubmit = handleSubmit(async (data: AddressFormData) => {
        history.push({
            pathname: "/privacy/withdraw/blank/accounts/step/confirm",
            state: {
                address: data.address,
                pair,
                ens: ensSelected,
                external: true,
            },
        })
    })

    return (
        <form className="w-full h-full" onSubmit={onSubmit}>
            <PopupLayout
                header={
                    <PopupHeader
                        title="Withdraw From Privacy Pool"
                        onBack={() => {
                            history.push({
                                pathname: "/privacy/withdraw/select",
                                state: { pair },
                            })
                        }}
                    />
                }
                footer={
                    <PopupFooter>
                        <ButtonWithLoading
                            label="Next"
                            disabled={ensSearch === ""}
                        />
                    </PopupFooter>
                }
            >
                {/* Search or Input */}
                {ensEnabled ? (
                    <div className="w-full p-6 pb-0">
                        <SearchInput
                            label="Ethereum Address"
                            placeholder="Enter public address or search ENS"
                            name="address"
                            ref={register}
                            error={errors.address?.message}
                            warning={warning}
                            autoFocus={false}
                            isValid={isAddress}
                            onChange={onChangeHandler}
                            debounce
                            //minSearchChar={3}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col p-6 space-y-1">
                        <TextInput
                            appearance="outline"
                            label="Ethereum Address"
                            placeholder="Enter Ethereum Address"
                            name="address"
                            register={register}
                            error={errors.address?.message}
                        />
                    </div>
                )}

                {/* Results */}
                {ensEnabled && ensResult ? (
                    <div className="flex flex-col space-y-4 p-6 pb-0">
                        <div
                            className={classnames(
                                "text-xs text-gray-500 pb-0 uppercase",
                                ensSearch.length > 2 ? "visible" : "hidden"
                            )}
                        >
                            ENS Result
                        </div>
                        {/*<div className="flex flex-col w-full">*/}
                        {ensResult ? (
                            <div
                                className={classnames(
                                    "flex flex-row text-sm items-center cursor-pointer mt-1 rounded-md transition-colors duration-300",
                                    isEnsSelected ? "bg-primary-100" : ""
                                )}
                                onClick={() => handleEnsClick(ensResult)}
                            >
                                <AccountDisplay
                                    networkNativeCurrency={
                                        network.nativeCurrency
                                    }
                                    account={
                                        {
                                            name: ensResult.name,
                                            address: ensResult.address,
                                        } as AccountInfo
                                    }
                                    selected={false}
                                    showAddress={true}
                                />
                                <img
                                    src={checkmarkMiniIcon}
                                    alt="checkmark"
                                    className={`
                                                absolute mr-8 right-0
                                                ${
                                                    isEnsSelected
                                                        ? "visible"
                                                        : "hidden"
                                                }
                                            `}
                                />
                            </div>
                        ) : (
                            <div
                                className={classnames(
                                    "text-base font-bold text-black w-full text-center mt-4",
                                    ensSearch.length >= 3 ? "visible" : "hidden"
                                )}
                            >
                                No corresponding ENS domain found
                            </div>
                        )}
                    </div>
                ) : null}
                <AddressBookSelect
                    filter={ensSearch}
                    onSelect={(account: any) => {
                        setValue("address", account.address, {
                            shouldValidate: true,
                        })
                        setEnsSearch(account.address)
                        setIsAddress(true)
                        setEnsResult(undefined)
                    }}
                />
            </PopupLayout>
        </form>
    )
}

export default WithdrawExternalPage
