import React, { useEffect, useState } from "react"

import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"

import { Classes } from "../../styles/classes"

import Divider from "../../components/Divider"
import connectIcon from "../../assets/images/icons/connect_dapp.svg"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import AccountMultipleSelect from "../../components/account/AccountMultipleSelect"
import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import AppIcon from "../../components/icons/AppIcon"
import { confirmPermission } from "../../context/commActions"
import { usePendingPermissionRequest } from "../../context/hooks/usePendingPermissionRequest"
import { Redirect } from "react-router-dom"
import LoadingOverlay from "../../components/loading/LoadingOverlay"
import { AiFillInfoCircle } from "react-icons/ai"
import Tooltip from "../../components/label/Tooltip"
import { useSortedAccounts } from "../../context/hooks/useSortedAccounts"
import useNextRequestRoute from "../../context/hooks/useNextRequestRoute"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import AccountSearchBar from "../../components/account/AccountSearchBar"
import { filterAccounts } from "../../util/filterAccounts"

const ConnectPage = () => {
    const { requestId } = usePendingPermissionRequest()
    const route = useNextRequestRoute()
    return requestId ? <ConnectSteps /> : <Redirect to={route} />
}

const ConnectSteps = () => {
    const accountsList = useSortedAccounts()
    const account = useSelectedAccount()

    const { requestCount, requestId, site } = usePendingPermissionRequest()

    // State
    const [selectedAccounts, setSelectedAccounts] = useState<AccountInfo[]>([
        account,
    ])
    const [filteredAccounts, setFilteredAccounts] = useState<AccountInfo[]>([
        account, // Place selected account at the top
        ...accountsList.filter((a) => a.address !== account.address),
    ])

    const [step, setStep] = useState(1)
    const [allowSite, setAllowSite] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [checkAll, setCheckAll] = useState(false)

    const nextEnabled = step === 1 ? selectedAccounts.length > 0 : allowSite

    const next = async () => {
        step === 1 ? setStep(2) : confirm()
    }

    const cancel = () => {
        step === 2 ? setStep(1) : confirm(false)
    }

    const confirm = async (accept = true) => {
        try {
            setIsConfirming(true)
            requestCount > 1 && setIsLoading(true)

            await confirmPermission(
                requestId,
                accept ? selectedAccounts.map((a) => a.address) : null
            )
            setIsConfirming(false)
            if (requestCount !== 1) {
                await new Promise((resolve) => setTimeout(resolve, 400))
                setStep(1)
                setSelectedAccounts([])
                setIsLoading(false)
            }
        } catch {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (selectedAccounts.length !== filteredAccounts.length) {
            setCheckAll(false)
        }
    }, [selectedAccounts, filteredAccounts])

    return (
        <PopupLayout
            header={
                <PopupHeader
                    title="Connect With BlockWallet"
                    close={false}
                    disabled={isConfirming}
                    onBack={cancel}
                >
                    {requestCount > 1 && (
                        <div className="group relative">
                            <AiFillInfoCircle
                                size={26}
                                className="pl-2 text-primary-200 cursor-pointer hover:text-primary-300"
                            />
                            <Tooltip
                                content={`${requestCount - 1} more ${
                                    requestCount > 2 ? "requests" : "request"
                                }`}
                            />
                        </div>
                    )}
                    <span className="ml-auto text-sm text-gray-600">
                        {step} of 2
                    </span>
                </PopupHeader>
            }
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        label={step === 1 ? "Next" : "Connect"}
                        isLoading={isConfirming}
                        disabled={!nextEnabled}
                        onClick={next}
                    />
                </PopupFooter>
            }
        >
            {isLoading && <LoadingOverlay />}
            <div className="flex flex-col items-center w-full p-6 space-y-3">
                <AppIcon
                    iconURL={site.siteMetadata.iconURL || connectIcon}
                    size={14}
                    background={false}
                />
                <span className="text-sm text-gray-800">{site.origin}</span>
                <span className="text-xs text-gray-600">
                    Only connect with sites you trust.
                </span>
            </div>
            <Divider />
            {step === 1 ? (
                <div className="flex flex-col p-6 space-y-5">
                    <AccountSearchBar
                        setIsSearching={(value) => {
                            if (!value) setFilteredAccounts(accountsList)
                        }}
                        onChange={(value) => {
                            // Filter accounts if filter has value otherwise display full account list.
                            setFilteredAccounts(
                                value
                                    ? filterAccounts(
                                          accountsList,
                                          value.toLowerCase()
                                      )
                                    : accountsList
                            )
                        }}
                    />
                    <div className="flex flex-row items-center justify-start w-full text-sm space-x-4 cursor-pointer">
                        <input
                            type="checkbox"
                            className={Classes.checkboxAlt}
                            checked={checkAll}
                            onClick={() => {
                                !checkAll
                                    ? setSelectedAccounts(filteredAccounts)
                                    : setSelectedAccounts([])
                            }}
                            onChange={() => {
                                setCheckAll((c) => !c)
                            }}
                            id="selectAll"
                        />
                        <label
                            className="text-gray-600 cursor-pointer"
                            htmlFor="selectAll"
                        >
                            Please select accounts:
                        </label>
                    </div>
                    <div className="flex flex-col space-y-3 text-sm text-gray-600">
                        <AccountMultipleSelect
                            accounts={filteredAccounts}
                            selectedAccount={account}
                            value={selectedAccounts}
                            onChange={setSelectedAccounts}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col p-6 space-y-6">
                    <span className="text-sm text-gray-600">
                        Allow this site to:
                    </span>
                    <div className="flex flex-row items-center space-x-4 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            className={Classes.checkboxAlt}
                            checked={allowSite}
                            onChange={() => setAllowSite(!allowSite)}
                            id="allowCheck"
                        />
                        <label className="cursor-pointer" htmlFor="allowCheck">
                            View the addresses of your permitted accounts
                            (required)
                        </label>
                    </div>
                </div>
            )}
        </PopupLayout>
    )
}

export default ConnectPage
