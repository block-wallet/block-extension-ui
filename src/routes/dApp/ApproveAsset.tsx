import * as yup from "yup"
import AccountIcon from "../../components/icons/AccountIcon"
import CheckBoxDialog from "../../components/dialog/CheckboxDialog"
import Divider from "../../components/Divider"
import GasPriceComponent from "../../components/transactions/GasPriceComponent"
import LoadingOverlay from "../../components/loading/LoadingOverlay"
import MiniCheckmark from "../../components/icons/MiniCheckmark"
import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import React, { useState, useEffect, FunctionComponent, useRef } from "react"
import SuccessDialog from "../../components/dialog/SuccessDialog"
import Tooltip from "../../components/label/Tooltip"
import useNextRequestRoute from "../../context/hooks/useNextRequestRoute"
import {
    confirmTransaction,
    getTokenBalance,
    rejectTransaction,
    searchTokenInAssetsList,
    setUserSettings,
} from "../../context/commActions"
import { AiFillInfoCircle } from "react-icons/ai"
import { BigNumber, ethers } from "ethers"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import { Classes, classnames } from "../../styles/classes"
import { GasPriceSelector } from "../../components/transactions/GasPriceSelector"
import { InferType } from "yup"
import { Redirect } from "react-router-dom"
import { TransactionCategories } from "../../context/commTypes"
import { TransactionFeeData } from "@blank/background/controllers/erc-20/transactions/SignedTransaction"
import { capitalize } from "../../util/capitalize"
import { formatName } from "../../util/formatAccount"
import { formatRounded } from "../../util/formatRounded"
import { formatUnits, getAddress, parseUnits } from "ethers/lib/utils"
import { getAccountColor } from "../../util/getAccountColor"
import { useBlankState } from "../../context/background/backgroundHooks"
import { useForm } from "react-hook-form"
import { useSelectedAccountBalance } from "../../context/hooks/useSelectedAccountBalance"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import {
    UnapprovedTransaction,
    useUnapprovedTransaction,
} from "../../context/hooks/useUnapprovedTransaction"
import { useUserSettings } from "../../context/hooks/useUserSettings"
import { yupResolver } from "@hookform/resolvers/yup"
import { stripHexPrefix } from "ethereumjs-util"
import { AdvancedSettings } from "../../components/transactions/AdvancedSettings"
import { TransactionAdvancedData } from "@blank/background/controllers/transactions/utils/types"
import { parseAllowance } from "../../util/approval"
import { useTokensList } from "../../context/hooks/useTokensList"

const UNKNOWN_BALANCE = "UNKNOWN_BALANCE"
const UNLIMITED_ALLOWANCE = ethers.constants.MaxUint256

// Schema
const GetAllowanceYupSchema = (
    isCustomSelected: boolean,
    tokenDecimals: number
) => {
    return yup.object({
        customAllowance: yup.string().when([], {
            is: () => isCustomSelected,
            then: yup
                .string()
                .required("Please enter a custom allowance")
                .test("is-number-regex", "Please enter a number", (value) => {
                    if (typeof value != "string") return false
                    const regexp = /^\d+(\.\d+)?$/
                    return regexp.test(value)
                })
                .test("decimals", "Too many decimal numbers", (value) => {
                    if (typeof value != "string") return false
                    if (!value.includes(".")) return true

                    const valueDecimals = value.split(".")[1].length

                    return valueDecimals <= tokenDecimals
                })
                .test(
                    "non-parsable",
                    "Couldn't parse this allowance",
                    (value) => {
                        if (typeof value != "string") return false
                        const parsed = parseUnits(value, tokenDecimals)

                        if (!parsed || !BigNumber.isBigNumber(parsed)) {
                            return false
                        }

                        return true
                    }
                )
                .test(
                    "large",
                    "Allowance is larger than unlimited allowance",
                    (value) => {
                        if (typeof value != "string") return false
                        let parsedCustomAllowance = stripHexPrefix(
                            parseUnits(value, tokenDecimals)._hex
                        )

                        return parsedCustomAllowance.length < 64
                    }
                ),
        }),
    })
}

export interface ApproveAssetProps {
    unnapprovedTransaction: UnapprovedTransaction
    isConfirming: boolean
    setIsConfirming: (v: boolean) => void
}

const ApproveAssetPage = () => {
    const latestUnnapprovedTransaction = useUnapprovedTransaction()
    const route = useNextRequestRoute()
    const [isConfirming, setIsConfirming] = useState(false)
    const unnapprovedTransaction = useRef(latestUnnapprovedTransaction)
    const setConfirm = (v: boolean) => {
        setIsConfirming(v)
    }

    // Update dappRequest if it's not confirming
    if (!isConfirming) {
        unnapprovedTransaction.current = latestUnnapprovedTransaction
    }

    if (
        !unnapprovedTransaction.current ||
        !unnapprovedTransaction.current.transaction ||
        unnapprovedTransaction.current.transaction.transactionCategory !==
            TransactionCategories.TOKEN_METHOD_APPROVE
    ) {
        return <Redirect to={route} />
    } else {
        return (
            <ApproveAsset
                unnapprovedTransaction={unnapprovedTransaction.current}
                isConfirming={isConfirming}
                setIsConfirming={setConfirm}
            />
        )
    }
}

const ApproveAsset: FunctionComponent<ApproveAssetProps> = ({
    unnapprovedTransaction,
    isConfirming,
    setIsConfirming,
}) => {
    // Hooks
    const { accounts, selectedAddress, settings } = useBlankState()!
    const { chainId, isEIP1559Compatible, name } = useSelectedNetwork()
    const { hideAddressWarning } = useUserSettings()
    const selectedAccountBalance = useSelectedAccountBalance()
    const { nativeToken } = useTokensList()

    // Get tx
    const {
        transactionCount,
        transactionId,
        transaction,
        params,
    } = unnapprovedTransaction

    // Detect if the transaction was triggered using an address different to the active one
    const checksumFromAddress = getAddress(params.from!)
    const differentAddress = checksumFromAddress !== selectedAddress

    // If differentAddress, fetch the balance of that address instead of the selected one.
    const balance = differentAddress
        ? accounts[checksumFromAddress].balances[chainId].nativeTokenBalance ??
          BigNumber.from("0")
        : selectedAccountBalance

    // Local state
    const [tokenName, setTokenName] = useState("")
    const [isEditAllowancePage, setIsEditAllowancePage] = useState(false)
    const [isCustomSelected, setIsCustomSelected] = useState(false)
    const [customAllowance, setCustomAllowance] = useState("")
    const [isCustomAllowanceSaved, setIsCustomAllowanceSaved] = useState(false)
    const [accountWarningClosed, setAccountWarningClosed] = useState(false)
    const [assetBalance, setAssetBalance] = useState("")
    const [isLoading, setIsLoading] = useState(transaction.loadingGasValues)
    const [showDialog, setShowDialog] = useState(false)

    const [
        transactionAdvancedData,
        setTransactionAdvancedData,
    ] = useState<TransactionAdvancedData>({})

    const [hasBalance, setHasBalance] = useState(true)
    const [gasEstimationFailed, setGasEstimationFailed] = useState(false)

    const [defaultGas, setDefaultGas] = useState<TransactionFeeData>({
        gasLimit: params.gasLimit,
        gasPrice: params.gasPrice,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        maxFeePerGas: params.maxFeePerGas,
    })

    const [transactionGas, setTransactionGas] = useState<TransactionFeeData>({
        gasLimit: params.gasLimit,
        gasPrice: params.gasPrice,
        maxPriorityFeePerGas: params.maxPriorityFeePerGas,
        maxFeePerGas: params.maxFeePerGas,
    })

    const calcTranTotals = () => {
        const gas = BigNumber.from(
            transactionGas.gasLimit!.mul(
                transactionGas.gasPrice ?? transactionGas.maxFeePerGas!
            )
        )

        setHasBalance(gas.lt(balance))
    }

    // Set data
    const account = accounts[getAddress(params.from!)]
    const tokenAddress = params.to!
    const tokenDecimals = transaction.advancedData?.decimals!
    const defaultAllowance = transaction.advancedData?.allowance!
    const networkName = capitalize(name)

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

    useEffect(
        () => {
            getTokenBalance(tokenAddress, account.address)
                .then((fetchedBalance) => {
                    setAssetBalance(
                        formatRounded(formatUnits(fetchedBalance || "0"))
                    )
                })
                .catch((error: Error) => {
                    // This shouldn't happen
                    if (error.message.includes("code=CALL_EXCEPTION")) {
                        setAssetBalance(UNKNOWN_BALANCE)
                    }
                })

            searchTokenInAssetsList(tokenAddress)
                .then((token) => {
                    setTokenName(token[0].symbol)
                })
                .catch(() => {
                    throw new Error("Failed to fetch token data")
                })
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [params, tokenAddress, account]
    )

    const approve = async () => {
        try {
            setIsConfirming(true)
            setIsLoading(true)

            await confirmTransaction(transaction.id, transactionGas, {
                customAllowance: isCustomAllowanceSaved
                    ? parseAllowance(customAllowance, tokenDecimals)
                    : undefined,
                customNonce: transactionAdvancedData.customNonce,
            })

            await new Promise((resolve) => setTimeout(resolve, 600))
        } finally {
            setIsConfirming(false)
            setIsLoading(false)
        }
    }

    const reject = async () => {
        try {
            setIsConfirming(true)
            setIsLoading(true)

            await rejectTransaction(transactionId)

            await new Promise((resolve) => setTimeout(resolve, 600))
        } finally {
            setIsConfirming(false)
            setIsLoading(true)
        }
    }

    // Validator
    const schema = GetAllowanceYupSchema(isCustomSelected, tokenDecimals)
    type CustomAllowanceForm = InferType<typeof schema>

    const {
        register,
        handleSubmit,
        setValue,
        errors,
    } = useForm<CustomAllowanceForm>({
        resolver: yupResolver(schema),
    })

    const handleChangeAllowance = (event: any) => {
        let value = event.target.value

        value = value
            .replace(",", ".")
            .replace(/[^0-9.]/g, "")
            .replace(/(\..*?)\..*/g, "$1")

        if (!value || value === ".") {
            value = ""
        }

        setValue("customAllowance", value, {
            shouldValidate: true,
        })
    }

    const handleFocus = (event: any) => {
        if (isCustomAllowanceSaved) {
            setValue("customAllowance", customAllowance, {
                shouldValidate: true,
            })
        }
    }

    const onSubmit = handleSubmit(async (values: CustomAllowanceForm) => {
        if (isCustomSelected) {
            setCustomAllowance(values.customAllowance!)
        }
        setIsCustomAllowanceSaved(isCustomSelected)
        setIsEditAllowancePage(false)
    })

    const mainSection = () => (
        <>
            <div className="px-6 py-3">
                <p className="text-sm font-bold pb-3">{`Allow ${transaction.origin} to access your ${tokenName}`}</p>
                <p className="text-sm text-gray-500">
                    {`By granting this permission, you are allowing ${transaction.origin} to
                        withdraw your ${tokenName} and automate transactions for you.`}
                </p>
            </div>
            <Divider />
            <div className="flex flex-col space-y-2 px-6 py-3">
                <p className="text-xs text-gray-600">Transaction fee</p>
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
                <AdvancedSettings
                    config={{
                        showCustomNonce: true,
                        showFlashbots: false,
                        address: checksumFromAddress,
                    }}
                    data={{
                        flashbots: false,
                    }}
                    setData={(data) => {
                        setTransactionAdvancedData({
                            customNonce: data.customNonce,
                            flashbots: data.flashbots,
                        })
                    }}
                />
                <div
                    className="text-xs font-bold text-primary-300 cursor-pointer hover:underline"
                    onClick={() => setIsEditAllowancePage(true)}
                >
                    Edit allowance
                </div>
                <div className="text-xs text-red-500">
                    {!hasBalance && "Insufficient balance"}
                </div>
            </div>
        </>
    )

    const editAllowanceSection = () => (
        <div className="flex flex-col space-y-3 px-6 py-3">
            <p className="text-gray-500 text-sm">
                {`Allow ${transaction.origin} to withdraw and spend up to the following amount:`}
            </p>
            <div
                className="relative flex flex-col p-3 rounded-md border border-gray-200 cursor-pointer"
                onClick={() => {
                    setIsCustomSelected(false)
                }}
            >
                <div
                    className={classnames(
                        "absolute mr-6 right-0 top-6",
                        isCustomSelected ? "hidden" : "visible"
                    )}
                >
                    <MiniCheckmark fill="#1673FF" />
                </div>
                <p
                    className={classnames(
                        "text-sm font-bold",
                        !isCustomSelected && "text-primary-300"
                    )}
                >
                    {defaultAllowance === UNLIMITED_ALLOWANCE._hex
                        ? "Unlimited"
                        : "Requested"}
                </p>
                <p className="text-gray-500 text-xs pt-1 pb-2">
                    Spend limit requested
                </p>
                <p
                    className={classnames(
                        "text-sm",
                        isCustomSelected && "text-gray-400"
                    )}
                >{`${Number(
                    formatUnits(defaultAllowance, tokenDecimals)
                )} ${tokenName}`}</p>
            </div>
            <div
                className="relative flex flex-col p-3 rounded-md border border-gray-200 cursor-pointer"
                onClick={() => {
                    setIsCustomSelected(true)
                }}
            >
                <div
                    className={classnames(
                        "absolute mr-6 right-0 top-6",
                        isCustomSelected ? "visible" : "hidden"
                    )}
                >
                    <MiniCheckmark fill="#1673FF" />
                </div>
                <p
                    className={classnames(
                        "text-sm font-bold",
                        isCustomSelected && "text-primary-300"
                    )}
                >
                    Custom Limit
                </p>
                <p className="text-gray-500 text-xs pt-1 pb-2">
                    Enter custom max spend limit
                </p>
                <input
                    type="text"
                    name="customAllowance"
                    ref={register}
                    className={classnames(
                        Classes.inputBordered,
                        !isCustomSelected && "text-gray-400",
                        errors.customAllowance &&
                            "border-red-400 focus:border-red-600"
                    )}
                    autoComplete="off"
                    onInput={handleChangeAllowance}
                    placeholder={
                        isCustomAllowanceSaved
                            ? customAllowance
                            : "Enter custom limit..."
                    }
                    onFocus={handleFocus}
                />
                <span
                    className={classnames(
                        "text-xs text-red-500",
                        !errors.customAllowance && "hidden"
                    )}
                >
                    {errors.customAllowance?.message}
                </span>
            </div>
        </div>
    )

    return (
        <PopupLayout
            header={
                <PopupHeader
                    close={false}
                    title={isEditAllowancePage ? "Edit allowance" : "Approval"}
                    backButton={isEditAllowancePage}
                    onBack={() => setIsEditAllowancePage(false)}
                >
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
                    {isEditAllowancePage ? (
                        <ButtonWithLoading
                            label="Save"
                            type="submit"
                            onClick={onSubmit}
                        />
                    ) : (
                        <>
                            <ButtonWithLoading
                                buttonClass={Classes.liteButton}
                                label="Reject"
                                isLoading={isConfirming}
                                onClick={() => reject()}
                            />
                            <ButtonWithLoading
                                label="Approve"
                                isLoading={isConfirming}
                                disabled={!hasBalance}
                                onClick={() => setShowDialog(true)}
                            />
                        </>
                    )}
                </PopupFooter>
            }
        >
            <SuccessDialog
                open={showDialog}
                title="Success"
                message="Updated token allowance"
                timeout={1200}
                onDone={() => {
                    setShowDialog(false)
                    approve()
                }}
            />
            {isConfirming && <LoadingOverlay />}
            <CheckBoxDialog
                message={`Approval request was sent with an account that's different from the selected one in your wallet. \n\n Please select if you want to continue or reject the transaction.`}
                onClose={() => {
                    setAccountWarningClosed(true)
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
                    !accountWarningClosed &&
                    !hideAddressWarning &&
                    !isLoading
                }
                closeText="Reject"
                confirmText="Continue"
                showCheckbox
                checkboxText="Don't show this warning again"
            />
            <div className="px-6 py-3 flex flex-row items-center">
                <AccountIcon
                    className="w-10 h-10"
                    fill={getAccountColor(account.address)}
                />
                <div className="relative flex flex-col group space-y-1 ml-4">
                    <span className="text-sm font-bold">
                        {formatName(account.name, 15)}
                    </span>
                    <span className="text-xs text-gray-600">
                        {`${assetBalance} ${tokenName} - `}
                        {formatRounded(
                            formatUnits(
                                nativeToken.balance || "0",
                                nativeToken.token.decimals
                            )
                        )}
                        {` ${nativeToken.token.symbol}`}
                    </span>
                </div>
                <div className="flex flex-row items-center ml-auto p-1 px-2 pr-1 text-gray-600 rounded-md border border-primary-200 text-xs bg-green-100">
                    <span className="inline-flex rounded-full h-2 w-2 mr-2 animate-pulse bg-green-400 pointer-events-none" />
                    <span className="mr-1 pointer-events-none text-green-600">
                        {networkName}
                    </span>
                </div>
            </div>
            <Divider />
            {isEditAllowancePage ? editAllowanceSection() : mainSection()}
        </PopupLayout>
    )
}

export default ApproveAssetPage
