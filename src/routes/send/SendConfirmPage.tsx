import React, { FunctionComponent, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

// Components
import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import Spinner from "../../components/Spinner"
import { AssetSelection } from "../../components/assets/tokens/AssetSelection"
import { GasPriceSelector } from "../../components/transactions/GasPriceSelector"
import ErrorMessage from "../../components/error/ErrorMessage"

// Style
import classnames from "classnames"

// Assets
import checkmarkCircle from "../../assets/images/icons/checkmark_circle.svg"

// Utils
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { InferType } from "yup"
import { utils, BigNumber, constants } from "ethers"
import { formatHash } from "../../util/formatAccount"
import { formatUnits } from "ethers/lib/utils"
import { formatCurrency, toCurrencyAmount } from "../../util/formatCurrency"
import { DEFAULT_DECIMALS, SEND_GAS_COST } from "../../util/constants"

// Hooks
import { useBlankState } from "../../context/background/backgroundHooks"
import {
    getLatestGasPrice,
    getSendTransactionGasLimit,
    sendEther,
    sendToken,
} from "../../context/commActions"
import { useSelectedAccountBalance } from "../../context/hooks/useSelectedAccountBalance"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import {
    TokenWithBalance,
    useTokensList,
} from "../../context/hooks/useTokensList"
import GasPriceComponent from "../../components/transactions/GasPriceComponent"

// Types
import { EnsResult } from "../../util/searchEns"
import PopupLayout from "../../components/popup/PopupLayout"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { useGasPriceData } from "../../context/hooks/useGasPriceData"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import { Classes } from "../../styles"
import SuccessDialog from "../../components/dialog/SuccessDialog"
import { AdvancedSettings } from "../../components/transactions/AdvancedSettings"
import { TransactionFeeData } from "@blank/background/controllers/erc-20/transactions/SignedTransaction"
import { TransactionAdvancedData } from "@blank/background/controllers/transactions/utils/types"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"

// Schema
const GetAmountYupSchema = (
    balance: BigNumber,
    asset: TokenWithBalance | undefined,
    selectedGas: TransactionFeeData,
    isEIP1559Compatible: boolean | undefined
) => {
    return yup.object({
        asset: yup
            .string()
            .required("No asset selected.")
            .test("is-valid", "Please select an asset", (value) => {
                return !!value || value !== "" || value.length !== 42
            }),
        amount: yup
            .string()
            .test("is-correct", "Please select an asset.", () => {
                if (!asset) {
                    return false
                }
                return true
            })
            .required("No transaction amount provided")
            .test("is-number", "Please enter a number.", (value) => {
                if (typeof value != "string") return false
                return !isNaN(parseFloat(value))
            })
            .test("is-correct", "Please enter a number.", (value) => {
                if (typeof value != "string") return false
                const regexp = /^\d+(\.\d+)?$/
                return regexp.test(value)
            })
            .test(
                "is-correct",
                "Amount must be a positive number.",
                (value) => {
                    if (typeof value != "string") return false
                    return value === "0" || parseFloat(value) > 0
                }
            )
            .test("is-decimals", "Too many decimal numbers.", (value) => {
                if (typeof value != "string") return false
                if (!value.includes(".")) return true
                const decimals = asset?.token.decimals || DEFAULT_DECIMALS
                const valueDecimals = value.split(".")[1].length
                return valueDecimals <= decimals
            })
            .test("is-correct", "Insufficient balance for gas cost.", () => {
                return GasCostBalanceValidation(
                    balance,
                    selectedGas,
                    isEIP1559Compatible
                )
            })
            .test("is-correct", "Insufficient balance.", (value) => {
                try {
                    if (!asset) return false
                    const decimals = asset.token.decimals || DEFAULT_DECIMALS
                    const txAmount: BigNumber = utils.parseUnits(
                        value!.toString(),
                        decimals
                    )

                    if (asset.token.address === "0x0") {
                        return EtherSendBalanceValidation(
                            asset.balance,
                            txAmount,
                            selectedGas,
                            isEIP1559Compatible
                        )
                    } else {
                        if (
                            !GasCostBalanceValidation(
                                balance,
                                selectedGas,
                                isEIP1559Compatible
                            )
                        ) {
                            return false
                        }
                        return TokenSendBalanceValidation(
                            asset.balance,
                            txAmount
                        )
                    }
                } catch (e: any) {
                    return false
                }
            }),
        selectedGas: yup.string(),
        isEIP1559Compatible: yup.boolean(),
    })
}
const schema = GetAmountYupSchema(
    BigNumber.from("0"),
    undefined,
    {
        gasPrice: BigNumber.from("0"),
        gasLimit: BigNumber.from("0"),
        maxFeePerGas: BigNumber.from("0"),
        maxPriorityFeePerGas: BigNumber.from("0"),
    },
    false
)
type AmountFormData = InferType<typeof schema>

// Subcomponent
const AddressDisplay: FunctionComponent<{
    showingTheWholeAddress: boolean
    setShowingTheWholeAddress: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ showingTheWholeAddress, setShowingTheWholeAddress }) => {
    const history = useOnMountHistory()
    const accountAddress = history.location.state.address
    const ensSelected: EnsResult = history.location.state.ens

    return (
        <>
            <div
                className="flex flex-row items-center w-full px-6 py-3 space-x-3"
                style={{ maxWidth: "100vw" }}
                title={formatHash(accountAddress, accountAddress.length)}
                onClick={() =>
                    setShowingTheWholeAddress(!showingTheWholeAddress)
                }
            >
                <img
                    src={checkmarkCircle}
                    alt="checkmark"
                    className="w-4 h-4"
                />
                {ensSelected ? (
                    <div>
                        <span className="font-bold text-green-500 mr-2">
                            {ensSelected.name}
                        </span>
                        <span className="text-gray truncate">
                            {formatHash(accountAddress)}
                        </span>
                    </div>
                ) : (
                    <span className="font-bold text-green-500 truncate cursor-pointer">
                        {showingTheWholeAddress
                            ? formatHash(accountAddress, accountAddress.length)
                            : formatHash(accountAddress)}
                    </span>
                )}
            </div>
        </>
    )
}

// Tools
const LoadingSendEther = () => (
    <div className="flex flex-row items-center justify-center w-full h-full bg-primary-100">
        <Spinner size="2rem" />
    </div>
)
const BalanceValidation = (balance: BigNumber, amount: BigNumber): boolean => {
    return BigNumber.from(balance).gte(BigNumber.from(amount))
}

const GasCostBalanceValidation = (
    balance: BigNumber,
    selectedGas: TransactionFeeData,
    isEIP1559Compatible?: boolean
): boolean => {
    return BalanceValidation(
        BigNumber.from(balance),
        BigNumber.from(selectedGas.gasLimit).mul(
            BigNumber.from(
                isEIP1559Compatible
                    ? selectedGas.maxFeePerGas
                    : selectedGas.gasPrice
            )
        )
    )
}
const EtherSendBalanceValidation = (
    balance: BigNumber,
    txAmount: BigNumber,
    selectedGas: TransactionFeeData,
    isEIP1559Compatible?: boolean
): boolean => {
    balance = BigNumber.from(balance)
    txAmount = BigNumber.from(txAmount)
    selectedGas.gasLimit = BigNumber.from(selectedGas.gasLimit)
    const gasPrice: BigNumber = BigNumber.from(
        isEIP1559Compatible ? selectedGas.maxFeePerGas : selectedGas.gasPrice
    )

    txAmount = txAmount.add(selectedGas.gasLimit.mul(gasPrice))
    return BalanceValidation(balance, txAmount)
}
const TokenSendBalanceValidation = (
    balance: BigNumber,
    amount: BigNumber
): boolean => {
    return BalanceValidation(BigNumber.from(balance), BigNumber.from(amount))
}

const HasBalance = (selectedToken: TokenWithBalance): boolean => {
    return selectedToken && !BigNumber.from(selectedToken.balance).isZero()
}

// Page
const SendConfirmPage = () => {
    // Blank Hooks
    const blankState = useBlankState()!
    const network = useSelectedNetwork()
    const history: any = useOnMountHistory()
    const balance = useSelectedAccountBalance()
    const { address } = useSelectedAccount()

    const isEIP1559Compatible = network.isEIP1559Compatible
    const accountAddress = history.location.state.address
    const preSelectedAsset = history.location.state.asset

    // Tokens
    const { currentNetworkTokens, nativeToken } = useTokensList()
    const tokensList = [nativeToken].concat(currentNetworkTokens)

    // State
    const [error, setError] = useState("")
    const [saved, setSaved] = useState(false)
    const [txHash, setTxHash] = useState<string>()
    const [isLoading, setIsLoading] = useState(false)
    const [isGasLoading, setIsGasLoading] = useState(true)
    const [showingTheWholeAddress, setShowingTheWholeAddress] = useState(false)
    const [usingMax, setUsingMax] = useState(false)
    const [nativeCurrencyAmt, setNativeCurrency] = useState(0)
    const [selectedToken, setSelectedToken] = useState<TokenWithBalance>(
        preSelectedAsset ? preSelectedAsset : tokensList[0]
    )
    const { gasPricesLevels } = useGasPriceData()

    const [selectedGas, setSelectedGas] = useState<TransactionFeeData>({
        gasLimit: BigNumber.from(0),
        gasPrice: isEIP1559Compatible ? undefined : BigNumber.from(0),
        maxPriorityFeePerGas: isEIP1559Compatible
            ? BigNumber.from(0)
            : undefined,
        maxFeePerGas: isEIP1559Compatible ? BigNumber.from(0) : undefined,
    })

    const [defaultGas, setDefaultGas] = useState<TransactionFeeData>({
        gasLimit: SEND_GAS_COST,
        gasPrice: BigNumber.from(gasPricesLevels.average.gasPrice ?? 0),
    })

    const [gasEstimationFailed, setGasEstimationFailed] = useState(false)

    const [
        transactionAdvancedData,
        setTransactionAdvancedData,
    ] = useState<TransactionAdvancedData>({})

    const calcNativeCurrency = () => {
        if (!selectedToken) return

        try {
            const amount: number = Number(getValues().amount)
            const assetAmount: number = !isNaN(amount) && amount ? amount : 0
            const decimals = selectedToken?.token.decimals || DEFAULT_DECIMALS
            const symbol =
                selectedToken?.token.symbol.toUpperCase() ||
                network.nativeCurrency.symbol
            const txAmount: BigNumber = utils.parseUnits(
                assetAmount.toString(),
                decimals
            )
            setNativeCurrency(
                toCurrencyAmount(
                    txAmount,
                    blankState.exchangeRates[symbol],
                    decimals
                )
            )
        } catch {}
    }

    const schema = GetAmountYupSchema(
        balance,
        selectedToken,
        selectedGas,
        isEIP1559Compatible
    )

    const {
        register,
        handleSubmit,
        errors,
        clearErrors,
        setValue,
        getValues,
        trigger,
    } = useForm<AmountFormData>({
        resolver: yupResolver(schema),
    })

    const onSubmit = handleSubmit(async (data: AmountFormData) => {
        if (!selectedToken) return setError("Select a token first.")

        // Value
        const value = usingMax
            ? getMaxTransactionAmount()
            : utils.parseUnits(
                  data.amount.toString(),
                  selectedToken!.token.decimals || DEFAULT_DECIMALS // Default to eth decimals
              )

        setIsLoading(true)

        // Validation
        let balanceValidation: boolean = false
        let errorMessage: string = ""
        if (selectedToken.token.address === nativeToken.token.address) {
            balanceValidation = EtherSendBalanceValidation(
                balance,
                value,
                selectedGas,
                isEIP1559Compatible
            )
            errorMessage = `You don't have enough funds to send ${formatUnits(
                value,
                network.nativeCurrency.decimals
            )} ${network.nativeCurrency.symbol} + ${formatUnits(
                selectedGas.gasPrice ?? selectedGas.maxFeePerGas!,
                network.nativeCurrency.decimals
            )} ${network.nativeCurrency.symbol} (Gas cost)`
        } else {
            balanceValidation = GasCostBalanceValidation(
                balance,
                selectedGas,
                isEIP1559Compatible
            )
            errorMessage = `You don't have enough funds for the transaction gas cost ${formatUnits(
                selectedGas.gasPrice ?? selectedGas.maxFeePerGas!,
                network.nativeCurrency.decimals
            )} ${network.nativeCurrency.symbol}`
            if (balanceValidation) {
                balanceValidation = TokenSendBalanceValidation(
                    selectedToken.balance,
                    value
                )
                errorMessage = `You don't have enough funds to send ${formatUnits(
                    value,
                    selectedToken.token.decimals
                )} ${selectedToken.token.symbol}`
            }
        }

        if (!balanceValidation) {
            setError(errorMessage)
            setIsLoading(false)
            return
        }

        // Send
        try {
            let txHash: string = ""
            if (selectedToken.token.address === nativeToken.token.address) {
                txHash = await sendEther(
                    accountAddress,
                    selectedGas as TransactionFeeData,
                    value,
                    transactionAdvancedData
                )
            } else {
                txHash = await sendToken(
                    selectedToken.token.address,
                    accountAddress,
                    selectedGas as TransactionFeeData,
                    value,
                    transactionAdvancedData
                )
            }
            setTxHash(txHash)
            setSaved(true)
        } catch (error: any) {
            let errorMessage = "Error while sending"
            if (error.message.length > 50) {
                const endIndex = error.message.indexOf("(")
                if (endIndex !== -1) {
                    errorMessage = error.message.slice(0, endIndex)
                }
            } else {
                errorMessage = error.message
            }
            setError(errorMessage)
            setIsLoading(false)
        }
    })

    const getMaxTransactionAmount = (): BigNumber => {
        if (!selectedToken?.balance) return BigNumber.from("0")

        let maxTransactionAmount = BigNumber.from("0")

        // Check against balance only if selected token is native network currency, otherwise set max as selectedToken balance
        // and run the gas check on yup validation
        if (
            selectedToken?.token.address === nativeToken.token.address &&
            GasCostBalanceValidation(balance, selectedGas, isEIP1559Compatible)
        ) {
            maxTransactionAmount = BigNumber.from(balance).sub(
                BigNumber.from(
                    isEIP1559Compatible
                        ? selectedGas.maxFeePerGas
                        : selectedGas.gasPrice
                ).mul(BigNumber.from(selectedGas.gasLimit))
            )
        } else {
            maxTransactionAmount = BigNumber.from(selectedToken?.balance)
        }

        return maxTransactionAmount
    }

    const setMaxTransactionAmount = (_usingMax: boolean = usingMax) => {
        setUsingMax(_usingMax)
        if (_usingMax) {
            const maxTransactionAmount = getMaxTransactionAmount()
            const decimals = selectedToken?.token.decimals || DEFAULT_DECIMALS
            const formatAmount = formatUnits(
                BigNumber.from(maxTransactionAmount),
                decimals
            )
            setValue("amount", formatAmount, {
                shouldValidate: true,
            })
        } else {
            setValue("amount", "", {
                shouldValidate: false,
            })
            clearErrors("amount")
        }
        calcNativeCurrency()
    }

    const handleChangeAmount = (event: any) => {
        let value = event.target.value

        value = value
            .replace(/[^0-9.,]/g, "")
            .replace(",", ".")
            .replace(/(\..*?)\..*/g, "$1")

        if (value === ".") {
            value = ""
        }

        if (value === "") {
            setValue("amount", null)
            clearErrors("amount")
        } else {
            setValue("amount", value, {
                shouldValidate: true,
            })
        }

        calcNativeCurrency()
    }

    useEffect(() => {
        const fetch = async () => {
            try {
                setIsGasLoading(true)

                const {
                    gasLimit,
                    estimationSucceeded,
                } = await getSendTransactionGasLimit(
                    selectedToken.token.address,
                    accountAddress,
                    constants.One
                )

                setGasEstimationFailed(!estimationSucceeded)

                let gasPrice
                if (!isEIP1559Compatible) {
                    gasPrice = await getLatestGasPrice()
                }

                setDefaultGas({
                    gasLimit: BigNumber.from(gasLimit),
                    gasPrice: isEIP1559Compatible
                        ? undefined
                        : BigNumber.from(gasPrice),
                })

                setSelectedGas({
                    ...selectedGas,
                    gasLimit: BigNumber.from(gasLimit),
                })
            } catch {
            } finally {
                setIsGasLoading(false)
            }
        }
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedToken])

    // Effect triggered on selected gas change to update max amount if needed and recalculate validations.
    useEffect(() => {
        usingMax && setMaxTransactionAmount(usingMax)
        getValues().amount && trigger("amount")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGas])

    const [inputFocus, setInputFocus] = useState(false)
    return (
        <PopupLayout
            header={<PopupHeader title="Send" disabled={isLoading} />}
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        type="submit"
                        label="Confirm"
                        isLoading={isGasLoading || isLoading}
                        disabled={
                            errors.amount !== undefined ||
                            isLoading ||
                            isGasLoading
                        }
                        onClick={onSubmit}
                    />
                </PopupFooter>
            }
        >
            <SuccessDialog
                open={saved}
                title="Success"
                message="You've initiated the transfer."
                txHash={txHash}
                timeout={1400}
                onDone={() => history.push("/")}
            />
            <div className="w-full h-full">
                <div
                    className="flex flex-col w-full h-full"
                    style={{ maxHeight: "452px" }}
                >
                    <AddressDisplay
                        showingTheWholeAddress={showingTheWholeAddress}
                        setShowingTheWholeAddress={setShowingTheWholeAddress}
                    />

                    {isLoading ? (
                        <LoadingSendEther />
                    ) : (
                        <div
                            className="flex flex-col px-6"
                            style={{ maxWidth: "100vw" }}
                        >
                            {/* Asset */}
                            <AssetSelection
                                register={register}
                                error={errors.asset?.message}
                                setValue={setValue}
                                assets={tokensList}
                                defaultAsset={selectedToken}
                                onAssetChange={(asset: TokenWithBalance) => {
                                    setUsingMax(false)
                                    setValue("amount", null)
                                    calcNativeCurrency()
                                    clearErrors("amount")
                                    setSelectedToken(asset)
                                }}
                                topMargin={76}
                                bottomMargin={88}
                            />

                            {/* Amount */}
                            <div
                                className={classnames(
                                    "flex flex-col",
                                    !errors.amount && "mb-3"
                                )}
                            >
                                <div className="flex flex-row">
                                    <div className="flex items-start w-1/3">
                                        <label
                                            htmlFor="amount"
                                            className="ml-1 mb-2 text-sm text-gray-600"
                                        >
                                            Amount
                                        </label>
                                    </div>
                                </div>

                                <div
                                    className={classnames(
                                        Classes.blueSection,
                                        inputFocus && "bg-primary-200",
                                        errors.amount && "border-red-400"
                                    )}
                                >
                                    <div className="flex flex-col items-start">
                                        <input
                                            name="amount"
                                            type="text"
                                            ref={register}
                                            className={classnames(
                                                Classes.blueSectionInput
                                            )}
                                            placeholder={`0 ${
                                                selectedToken
                                                    ? selectedToken.token.symbol
                                                    : ""
                                            }`}
                                            autoComplete="off"
                                            autoFocus={true}
                                            onFocus={() => setInputFocus(true)}
                                            onBlur={() => setInputFocus(false)}
                                            onKeyDown={(e) => {
                                                setUsingMax(false)
                                                const amt = Number(
                                                    e.currentTarget.value
                                                )
                                                if (
                                                    !isNaN(Number(e.key)) &&
                                                    !isNaN(amt) &&
                                                    amt >=
                                                        Number.MAX_SAFE_INTEGER
                                                ) {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                }
                                            }}
                                            onInput={handleChangeAmount.bind(
                                                this
                                            )}
                                        />
                                        <span className="text-xs text-gray-600">
                                            {formatCurrency(nativeCurrencyAmt, {
                                                currency:
                                                    blankState.nativeCurrency,
                                                locale_info:
                                                    blankState.localeInfo,
                                                showSymbol: true,
                                            })}
                                        </span>
                                    </div>
                                    <div className="w-1/5">
                                        <span
                                            className={classnames(
                                                "float-right rounded-md cursor-pointer border p-1",
                                                usingMax
                                                    ? "bg-primary-300 border-primary-300 text-white hover:bg-blue-600 hover:border-blue-600"
                                                    : "bg-blue-200 border-blue-200 hover:bg-blue-300 hover:border-blue-300",
                                                !HasBalance(selectedToken) &&
                                                    "pointer-events-none text-gray-600"
                                            )}
                                            title="Use all the available funds"
                                            onClick={() => {
                                                if (HasBalance(selectedToken)) {
                                                    setMaxTransactionAmount(
                                                        !usingMax
                                                    )
                                                }
                                            }}
                                        >
                                            max
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className={`${
                                        errors.amount?.message
                                            ? "pl-1 my-2"
                                            : null
                                    }`}
                                >
                                    <ErrorMessage
                                        error={errors.amount?.message}
                                    />
                                </div>
                            </div>

                            {/* Speed */}
                            <label className="ml-1 mb-2 text-sm text-gray-600">
                                Gas Price
                            </label>

                            {!isEIP1559Compatible ? (
                                <GasPriceSelector
                                    defaultGasLimit={defaultGas.gasLimit!}
                                    defaultGasPrice={defaultGas.gasPrice!}
                                    setGasPriceAndLimit={(
                                        gasPrice,
                                        gasLimit
                                    ) => {
                                        setSelectedGas({ gasPrice, gasLimit })
                                    }}
                                    isParentLoading={isGasLoading}
                                    showEstimationError={gasEstimationFailed}
                                />
                            ) : (
                                <GasPriceComponent
                                    defaultGas={{
                                        defaultLevel: "medium",
                                        feeData: {
                                            gasLimit: defaultGas.gasLimit!,
                                        },
                                    }}
                                    isParentLoading={isGasLoading}
                                    setGas={(gasFees) => {
                                        setSelectedGas({
                                            ...gasFees,
                                        })
                                    }}
                                    showEstimationError={gasEstimationFailed}
                                />
                            )}
                            <div className={`${error ? "pl-1 my-2" : null}`}>
                                <ErrorMessage error={error} />
                            </div>

                            <div className="mt-3">
                                <AdvancedSettings
                                    config={{
                                        showCustomNonce: true,
                                        showFlashbots: false,
                                        address,
                                    }}
                                    data={{}}
                                    setData={function (
                                        data: TransactionAdvancedData
                                    ): void {
                                        setTransactionAdvancedData({
                                            customNonce: data.customNonce,
                                        })
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PopupLayout>
    )
}

export default SendConfirmPage
