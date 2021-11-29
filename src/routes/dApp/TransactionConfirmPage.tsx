import React, { useState } from "react"
import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import { Classes, classnames } from "../../styles"
import arrowRight from "../../assets/images/icons/arrow_right_black.svg"
import AccountIcon from "../../components/icons/AccountIcon"
import eth from "../../assets/images/icons/ETH.svg"
import { useUnapprovedTransaction } from "../../context/hooks/useUnapprovedTransaction"
import { formatUnits, getAddress } from "ethers/lib/utils"
import CopyTooltip from "../../components/label/СopyToClipboardTooltip"
import { formatName } from "../../util/formatAccount"
import { useBlankState } from "../../context/background/backgroundHooks"
import { formatCurrency, toCurrencyAmount } from "../../util/formatCurrency"
import { BigNumber } from "ethers"
import {
    confirmTransaction,
    rejectTransaction,
    setUserSettings,
} from "../../context/commActions"
import { useSelectedAccountBalance } from "../../context/hooks/useSelectedAccountBalance"
import { useEffect } from "react"
import { HiOutlineExclamationCircle } from "react-icons/hi"
import { getAccountColor } from "../../util/getAccountColor"
import { formatNumberLength } from "../../util/formatNumberLength"
import { Redirect } from "react-router-dom"
import { GasPriceSelector } from "../../components/transactions/GasPriceSelector"
import { BsFileEarmarkText } from "react-icons/bs"
import { AiFillInfoCircle } from "react-icons/ai"
import Tooltip from "../../components/label/Tooltip"
import LoadingOverlay from "../../components/LoadingOverlay"
import GasPriceComponent from "../../components/transactions/GasPriceComponent"
import { FeeData } from "@blank/background/controllers/GasPricesController"

import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"

import useNextRequestRoute from "../../context/hooks/useNextRequestRoute"
import { useUserSettings } from "../../context/hooks/useUserSettings"
import { useGasPriceData } from "../../context/hooks/useGasPriceData"
import CheckBoxDialog from "../../components/dialog/CheckboxDialog"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"

const TransactionConfirmPage = () => {
    const { transaction } = useUnapprovedTransaction()
    const route = useNextRequestRoute()

    return transaction ? <TransactionConfirm /> : <Redirect to={route} />
}

const TransactionConfirm = () => {
    //Hooks
    const {
        accounts,
        exchangeRates,
        nativeCurrency,
        localeInfo,
        networkNativeCurrency,
        selectedAddress,
        settings,
    } = useBlankState()!
    const { isEIP1559Compatible } = useGasPriceData()

    const { hideAddressWarning } = useUserSettings()

    const network = useSelectedNetwork()
    const defaultNetworkLogo = network.iconUrls ? network.iconUrls[0] : eth

    const {
        transactionCount,
        transactionId,
        transaction,
        params,
    } = useUnapprovedTransaction()

    // Flag to detect if the transaction was triggered using an address different to the active one
    const checksumFromAddress = getAddress(params.from!)
    const differentAddress = checksumFromAddress !== selectedAddress
    const [dialogClosed, setDialogClosed] = useState(false)

    const selectedAccountBalance = useSelectedAccountBalance()
    // If differentAddress, fetch the balance of that address instead of the selected one.

    const balance = differentAddress
        ? accounts[checksumFromAddress].balances[network.chainId]
              .nativeTokenBalance ?? BigNumber.from("0")
        : selectedAccountBalance

    // State variables
    const ethExchangeRate = exchangeRates[networkNativeCurrency.symbol]
    const [isLoading, setIsLoading] = useState(transaction.loadingGasValues)
    const [hasBalance, setHasBalance] = useState(true)
    const [isConfirming, setIsConfirming] = useState(false)
    const [copied, setCopied] = useState(false)
    const [gasEstimationFailed, setGasEstimationFailed] = useState(false)

    const [gasCost, setGasCost] = useState<BigNumber>(
        params.gasLimit.mul(params.gasPrice ?? params.maxFeePerGas!)
    )
    const [total, setTotal] = useState<BigNumber>(gasCost.add(params.value))
    const [totalInNativeCurrency, setTotalInNativeCurrency] = useState(
        toCurrencyAmount(
            total,
            ethExchangeRate,
            network.nativeCurrency.decimals
        )
    )

    const [defaultGas, setDefaultGas] = useState<FeeData>({
        gasLimit: params.gasLimit,
        gasPrice: params.gasPrice,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        maxFeePerGas: params.maxFeePerGas,
    })

    const [transactionGas, setTransactionGas] = useState<FeeData>({
        gasLimit: params.gasLimit,
        gasPrice: params.gasPrice,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        maxFeePerGas: params.maxFeePerGas,
    })

    const description =
        transaction.methodSignature?.name ??
        transaction.transactionCategory?.toString()
    const account = accounts[getAddress(params.from!)]
    const accountName = account ? account.name : "Blank"

    const calcTranTotals = () => {
        const gas = BigNumber.from(
            transactionGas.gasLimit!.mul(
                transactionGas.gasPrice ?? transactionGas.maxFeePerGas!
            )
        )
        const totalCalc = gas.add(params.value)

        setGasCost(gas)
        setTotal(totalCalc)
        setHasBalance(totalCalc.lt(balance))
        setTotalInNativeCurrency(
            toCurrencyAmount(
                totalCalc,
                ethExchangeRate,
                network.nativeCurrency.decimals
            )
        )
    }

    // To prevent calculations on every render, force dependency array to only check state value that impacts
    useEffect(() => {
        calcTranTotals()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionGas, transactionId])

    // Effect to check if background finishes loading default values
    useEffect(() => {
        if (isLoading && !transaction.loadingGasValues) {
            setDefaultGas({
                gasLimit: params.gasLimit,
                gasPrice: params.gasPrice,
                maxPriorityFeePerGas: params.maxPriorityFeePerGas,
                maxFeePerGas: params.maxFeePerGas,
            })
            setGasEstimationFailed(transaction.gasEstimationFailed ?? false)
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transaction.loadingGasValues])

    // Functions
    const confirm = async () => {
        try {
            setIsConfirming(true)
            transactionCount > 1 && setIsLoading(true)

            await confirmTransaction(transaction.id, transactionGas)

            if (transactionCount > 1) {
                await new Promise((resolve) => setTimeout(resolve, 400))
                setIsLoading(false)
                setIsConfirming(false)
            }
        } catch {
            // add error message for the ui
        }
    }

    const copy = async () => {
        await navigator.clipboard.writeText(params.to!)
        setCopied(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setCopied(false)
    }

    const reject = async () => {
        try {
            setIsConfirming(true)
            transactionCount > 1 && setIsLoading(true)
            await rejectTransaction(transactionId)
            if (transactionCount > 1) {
                await new Promise((resolve) => setTimeout(resolve, 400))
                setIsLoading(false)
                setIsConfirming(false)
            }
        } catch {}
    }

    return (
        <PopupLayout
            header={
                <PopupHeader title="Confirm" close={false} backButton={false}>
                    {transactionCount > 1 && (
                        <div className="group relative">
                            <AiFillInfoCircle
                                size={26}
                                className="pl-2 text-primary-200 cursor-pointer hover:text-primary-300"
                            />
                            <Tooltip
                                content={`${transactionCount - 1} more ${
                                    transactionCount > 2
                                        ? "transactions"
                                        : "transaction"
                                }`}
                            />
                        </div>
                    )}
                </PopupHeader>
            }
            footer={
                <PopupFooter>
                    <button
                        onClick={reject}
                        className={classnames(
                            Classes.liteButton,
                            isConfirming && "opacity-50 pointer-events-none"
                        )}
                    >
                        Reject
                    </button>
                    <ButtonWithLoading
                        label="Confirm"
                        isLoading={isConfirming}
                        disabled={!hasBalance}
                        onClick={confirm}
                    />
                </PopupFooter>
            }
        >
            <div className="flex flex-row items-center justify-between w-full px-6 py-4 border-b">
                {isLoading && <LoadingOverlay />}
                <CheckBoxDialog
                    message={`Transaction was sent with an account that's different from the selected one in your wallet. \n\n Please select if you want to continue or reject the transaction.`}
                    onClose={() => {
                        setDialogClosed(true)
                    }}
                    onCancel={reject}
                    onConfirm={(saveChoice) => {
                        if (saveChoice) {
                            setUserSettings({
                                ...settings,
                                hideAddressWarning: true,
                            })
                        }
                    }}
                    title="Different address detected"
                    open={
                        differentAddress &&
                        !dialogClosed &&
                        !hideAddressWarning &&
                        !isLoading
                    }
                    closeText="Reject"
                    confirmText="Continue"
                    showCheckbox
                    checkboxText="Don't show this warning again"
                />

                <div className="flex flex-row items-center w-2/5 justify-start">
                    <div>
                        <AccountIcon
                            className="h-6 w-6"
                            fill={getAccountColor(params.from!)}
                        />
                    </div>
                    <span
                        title={accountName}
                        className="pl-2 font-bold text-sm truncate ..."
                    >
                        {formatName(accountName, 24)}
                    </span>
                    {differentAddress && (
                        <div className="group relative">
                            <AiFillInfoCircle
                                size={20}
                                className="pl-2 text-yellow-600 cursor-pointer hover:text-yellow-700"
                            />
                            <Tooltip content="Account differs from the selected in your wallet" />
                        </div>
                    )}
                </div>

                <div className="flex flex-row items-center justify-center w-1/5 relative">
                    <div className="w-8 border rounded-full bg-white z-10">
                        <img src={arrowRight} className="p-2" alt="" />
                    </div>
                    <div
                        className="absolute border-t transform rotate-90 z-0"
                        style={{ width: "63px" }}
                    ></div>
                </div>

                {params.to ? (
                    <div
                        className="relative flex flex-row items-center cursor-pointer group w-2/5 justify-end"
                        onClick={copy}
                    >
                        <AccountIcon className="h-6 w-6" fill="black" />
                        <span className="pl-2 font-bold text-sm">
                            ...{params.to!.substr(-6)}
                        </span>
                        <CopyTooltip copied={copied} />
                    </div>
                ) : (
                    <div className="flex flex-row items-center relative w-2/5 justify-end">
                        <BsFileEarmarkText size={24} />
                        <span className="pl-1 font-bold text-sm">
                            New Contract
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col px-6 py-3 space-y-3 w-full">
                {description && (
                    <div className="flex flex-row w-full items-center justify-start py-0.5 ">
                        <HiOutlineExclamationCircle
                            size={20}
                            className="text-gray-600 font-bold"
                        />
                        <span className="text-xs text-gray-600 pl-2 font-medium capitalize">
                            {description}
                        </span>
                    </div>
                )}

                <div className="flex flex-col items-center p-4 rounded-md bg-primary-100 space-y-2">
                    <span title={transaction.origin} className="w-full text-xs">
                        {transaction.origin}
                    </span>
                    <div className="w-full flex flex-row items-center">
                        <img
                            src={defaultNetworkLogo}
                            alt={network.nativeCurrency.symbol}
                            width="12px"
                            height="18px"
                        />
                        <span
                            className="font-black pl-1 text-base"
                            title={
                                formatUnits(
                                    params.value!,
                                    network.nativeCurrency.decimals
                                ) + ` ${network.nativeCurrency.symbol}`
                            }
                        >
                            {formatNumberLength(
                                formatUnits(
                                    params.value!,
                                    network.nativeCurrency.decimals
                                ),
                                20
                            )}{" "}
                            {network.nativeCurrency.symbol}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label
                        className={classnames(
                            Classes.inputLabel,
                            "text-gray-600 pb-2"
                        )}
                    >
                        Gas Price
                    </label>

                    {!isEIP1559Compatible ? (
                        <GasPriceSelector
                            defaultGasLimit={defaultGas.gasLimit!}
                            defaultGasPrice={defaultGas.gasPrice!}
                            setGasPriceAndLimit={(gasPrice, gasLimit) => {
                                setTransactionGas({ gasPrice, gasLimit })
                            }}
                            showEstimationError={gasEstimationFailed}
                            isParentLoading={isLoading}
                        />
                    ) : (
                        <GasPriceComponent
                            defaultGas={{
                                feeData: {
                                    gasLimit: defaultGas.gasLimit,
                                    maxFeePerGas: defaultGas.maxFeePerGas!,
                                    maxPriorityFeePerGas: defaultGas.maxPriorityFeePerGas!,
                                },
                            }}
                            setGas={(gasFees) => {
                                setTransactionGas({
                                    ...gasFees,
                                })
                            }}
                            showEstimationError={gasEstimationFailed}
                            isParentLoading={isLoading}
                        />
                    )}
                </div>

                <div className="flex flex-col space-y-2">
                    <div
                        className={classnames(
                            "flex flex-col items-start px-4 pt-4 space-y rounded-md bg-primary-100",
                            !hasBalance
                                ? "border border-red-400 pb-2"
                                : "border-opacity-0 border-transparent pb-4"
                        )}
                    >
                        <div className="flex flex-row">
                            <label
                                htmlFor="amount"
                                className={classnames(
                                    Classes.inputLabel,
                                    "text-gray-500"
                                )}
                            >
                                AMOUNT + {isEIP1559Compatible && " MAX "} GAS
                                FEE
                            </label>
                        </div>
                        <div className="flex flex-col w-full space-y-1">
                            <div className="flex flex-row items-center justify-between w-full font-bold">
                                <span className="w-2/12 text-sm">Total:</span>
                                <span className="flex flex-row items-center justify-end w-10/12">
                                    <img
                                        src={defaultNetworkLogo}
                                        alt={network.nativeCurrency.symbol}
                                        width="12px"
                                        height="18px"
                                    />
                                    <span
                                        className="pl-1 text-base"
                                        title={
                                            formatUnits(
                                                total,
                                                network.nativeCurrency.decimals
                                            ) +
                                            ` ${network.nativeCurrency.symbol}`
                                        }
                                    >
                                        {formatNumberLength(
                                            formatUnits(
                                                total,
                                                network.nativeCurrency.decimals
                                            ),
                                            14
                                        )}{" "}
                                        {network.nativeCurrency.symbol}
                                    </span>
                                    {/*
                                    {selectedCurrency.toUpperCase()} */}
                                </span>
                            </div>
                            <span className="ml-auto text-xs text-gray-500">
                                {formatCurrency(totalInNativeCurrency, {
                                    currency: nativeCurrency,
                                    locale_info: localeInfo,
                                    showSymbol: true,
                                })}
                            </span>
                            <span className="text-xs text-red-500">
                                {!hasBalance && "Insufficient balance"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </PopupLayout>
    )
}

export default TransactionConfirmPage
