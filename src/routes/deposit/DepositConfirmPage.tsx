import React, { useEffect, useMemo, useState } from "react"

import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"

import { Classes } from "../../styles/classes"

import classnames from "classnames"

import { useBlankState } from "../../context/background/backgroundHooks"
import Divider from "../../components/Divider"

import { BigNumber } from "ethers"
import { formatUnits, parseUnits } from "ethers/lib/utils"

import { KnownCurrencies } from "@blank/background/controllers/blank-deposit/types"
import { useHasSufficientBalance } from "../../context/hooks/useHasSufficientBalance"
import {
    getApproveTransactionGasLimit,
    getDepositInstanceAllowance,
    getDepositTransactionGasLimit,
    getLatestGasPrice,
    makeBlankDeposit,
} from "../../context/commActions"
import { formatCurrency, toCurrencyAmount } from "../../util/formatCurrency"
import ErrorMessage from "../../components/error/ErrorMessage"
import { DEPOSIT_GAS_COST, APPROVE_GAS_COST } from "../../util/constants"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { TokenWithBalance } from "../../context/hooks/useTokensList"
import { GasPriceSelector } from "../../components/transactions/GasPriceSelector"
import { Token } from "@blank/background/controllers/erc-20/Token"
import { FeeData } from "@blank/background/controllers/GasPricesController"
import GasPriceComponent from "../../components/transactions/GasPriceComponent"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { formatNumberLength } from "../../util/formatNumberLength"
import { useGasPriceData } from "../../context/hooks/useGasPriceData"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import SuccessDialog from "../../components/dialog/SuccessDialog"

let freezedAmounts = {
    amountInNativeCurrency: 0,
    fee: BigNumber.from("0"),
    feeInNativeCurrency: 0,
    totalInNativeCurrency: 0,
    total: BigNumber.from("0"),
}

const DepositConfirmPage = () => {
    const history: any = useOnMountHistory()
    let { amount, selectedToken, selectedCurrency } = useMemo(
        () =>
            history.location.state as {
                amount: string
                selectedCurrency: KnownCurrencies
                selectedToken: TokenWithBalance
            },
        [history.location.state]
    )
    const [saved, setSaved] = useState(false)
    const [txHash, setTxHash] = useState<string>()
    const [isDepositing, setIsDepositing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [hasAllowance, setHasAllowance] = useState(true)

    const {
        exchangeRates,
        nativeCurrency,
        localeInfo,
        networkNativeCurrency,
    } = useBlankState()!

    const { isEIP1559Compatible, gasPrices } = useGasPriceData()

    const network = useSelectedNetwork()

    const [defaultGas, setDefaultGas] = useState<{
        gasPrice: BigNumber
        gasLimit: BigNumber
    }>({
        gasPrice: BigNumber.from(gasPrices.average.gasPrice ?? "0"),
        gasLimit: BigNumber.from(DEPOSIT_GAS_COST),
    })

    const [selectedFees, setSelectedFees] = useState({
        maxPriorityFeePerGas: BigNumber.from(
            gasPrices.average.maxPriorityFeePerGas ?? "0"
        ),
        maxFeePerGas: BigNumber.from(gasPrices.average.maxFeePerGas ?? "0"),
    })
    const [selectedGasPrice, setSelectedGasPrice] = useState(
        BigNumber.from(gasPrices.average.gasPrice ?? "0")
    )
    const [selectedGasLimit, setSelectedGasLimit] = useState(
        BigNumber.from(DEPOSIT_GAS_COST)
    )

    const [approveGasLimit, setApproveGasLimit] = useState(APPROVE_GAS_COST)

    // If it's EIP multiply by max fee instead
    const feePerGas = !isEIP1559Compatible
        ? selectedGasPrice
        : selectedFees.maxFeePerGas
    const fee = selectedGasLimit.mul(feePerGas)
    const approveFee =
        !hasAllowance && !isLoading
            ? approveGasLimit.mul(feePerGas)
            : BigNumber.from(0)

    const total =
        selectedToken.token.symbol === network.nativeCurrency.symbol
            ? parseUnits(amount, network.nativeCurrency.decimals)
                  .add(fee)
                  .add(approveFee)
            : fee.add(approveFee)

    // We check balance against state in case history balance is outdated
    const hasEthBalance = useHasSufficientBalance(BigNumber.from(total), {
        symbol: network.nativeCurrency.symbol,
        decimals: network.nativeCurrency.decimals,
    } as Token)

    const hasTokenBalance = useHasSufficientBalance(
        parseUnits(amount, selectedToken.token.decimals),
        selectedToken.token
    )

    const hasBalance =
        selectedToken.token.symbol === network.nativeCurrency.symbol
            ? hasEthBalance
            : hasEthBalance && hasTokenBalance

    const confirm = async () => {
        try {
            setIsDepositing(true)
            const txHash = await makeBlankDeposit(
                { currency: selectedCurrency, amount: amount as any },
                {
                    gasPrice: !isEIP1559Compatible
                        ? selectedGasPrice
                        : undefined,
                    gasLimit: selectedGasLimit,
                    maxFeePerGas: isEIP1559Compatible
                        ? selectedFees.maxFeePerGas
                        : undefined,
                    maxPriorityFeePerGas: isEIP1559Compatible
                        ? selectedFees.maxPriorityFeePerGas
                        : undefined,
                } as FeeData,
                true
            )
            setTxHash(txHash)
            setSaved(true)
        } catch {
            setError("Error making the deposit.")
            setIsDepositing(false)
        }
    }

    const ethExchangeRate = exchangeRates[networkNativeCurrency.symbol]
    const tokenExchangeRate = exchangeRates[selectedToken.token.symbol]

    const amountInNativeCurrency = toCurrencyAmount(
        parseUnits(amount, selectedToken.token.decimals),
        tokenExchangeRate,
        selectedToken.token.decimals
    )

    const feeInNativeCurrency = toCurrencyAmount(
        fee,
        ethExchangeRate,
        network.nativeCurrency.decimals
    )
    const totalInNativeCurrency = toCurrencyAmount(
        total,
        ethExchangeRate,
        network.nativeCurrency.decimals
    )
    const canDeposit = hasBalance && !isDepositing && !isLoading

    if (!isDepositing) {
        freezedAmounts = {
            amountInNativeCurrency,
            fee,
            feeInNativeCurrency,
            totalInNativeCurrency,
            total,
        }
    }

    useEffect(() => {
        const fetch = async () => {
            try {
                setIsLoading(true)
                const pair = {
                    currency: selectedCurrency,
                    amount: amount as any,
                }
                const depositGasLimit = selectedToken
                    ? BigNumber.from(
                          (await getDepositTransactionGasLimit(pair)).gasLimit
                      )
                    : BigNumber.from(DEPOSIT_GAS_COST)

                let gasPrice

                if (!isEIP1559Compatible) {
                    gasPrice = await getLatestGasPrice()
                }

                if (selectedToken.token.address !== "0x0") {
                    const approveGas = selectedToken
                        ? BigNumber.from(
                              (
                                  await getApproveTransactionGasLimit(
                                      selectedToken.token.address
                                  )
                              ).gasLimit
                          )
                        : BigNumber.from(DEPOSIT_GAS_COST)

                    const allowance = await getDepositInstanceAllowance(pair)

                    setApproveGasLimit(approveGas)

                    setHasAllowance(
                        BigNumber.from(allowance).gt(
                            parseUnits(amount, selectedToken.token.decimals)
                        )
                    )
                }

                setDefaultGas({
                    gasLimit: BigNumber.from(depositGasLimit),
                    gasPrice: BigNumber.from(
                        !isEIP1559Compatible ? gasPrice : 0
                    ),
                })
            } catch {
            } finally {
                setIsLoading(false)
            }
        }
        fetch()
    }, [amount, isEIP1559Compatible, selectedCurrency, selectedToken])

    return (
        <PopupLayout
            header={
                <PopupHeader
                    title="Confirm Deposit"
                    close={!isDepositing ? "/" : ""}
                />
            }
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        type="submit"
                        onClick={confirm}
                        disabled={!canDeposit}
                        isLoading={isDepositing}
                        label="Confirm"
                    />
                </PopupFooter>
            }
        >
            <SuccessDialog
                open={saved}
                title="Success"
                message="You've initiated the deposit."
                txHash={txHash}
                timeout={1400}
                onDone={() => history.push("/")}
            />
            <div className="flex flex-col p-6 space-y-6">
                <div className="flex flex-col space-y-2">
                    <div className="flex flex-col items-start p-4 rounded-md bg-primary-100">
                        <span className="bg-transparent border-none p-2 -ml-2 -mt-2 font-bold text-base">
                            {amount} {selectedCurrency.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">
                            {formatCurrency(
                                freezedAmounts.amountInNativeCurrency,
                                {
                                    currency: nativeCurrency,
                                    locale_info: localeInfo,
                                    showSymbol: true,
                                }
                            )}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    <label htmlFor="amount" className={Classes.inputLabel}>
                        Gas Fee
                    </label>
                    {!isEIP1559Compatible ? (
                        <GasPriceSelector
                            defaultGasLimit={defaultGas.gasLimit}
                            defaultGasPrice={defaultGas.gasPrice}
                            setGasPriceAndLimit={(gasPrice, gasLimit) => {
                                setSelectedGasPrice(gasPrice)
                                setSelectedGasLimit(gasLimit)
                            }}
                            isParentLoading={isLoading}
                            disabled={isLoading}
                        />
                    ) : (
                        <GasPriceComponent
                            defaultGas={{
                                defaultLevel: "medium",
                                feeData: {
                                    gasLimit: defaultGas.gasLimit,
                                },
                            }}
                            setGas={(gasFees) => {
                                setSelectedGasLimit(gasFees.gasLimit!)
                                setSelectedFees({
                                    maxFeePerGas: gasFees.maxFeePerGas!,
                                    maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas!,
                                })
                            }}
                            isParentLoading={isLoading}
                            disabled={isLoading}
                        />
                    )}
                </div>
            </div>
            <Divider />
            <div className="flex flex-col p-6 space-y-6">
                <div className="flex flex-col space-y-2">
                    <div
                        className={classnames(
                            "flex flex-col items-start p-4 space-y-2 rounded-md bg-primary-100",
                            !hasBalance
                                ? "border border-red-400"
                                : "border-opacity-0 border-transparent"
                        )}
                    >
                        <label
                            htmlFor="amount"
                            className={classnames(
                                Classes.inputLabel,
                                "text-gray-500"
                            )}
                        >
                            AMOUNT {!hasAllowance && "+ APPROVE FEE"} +{" "}
                            {isEIP1559Compatible && " MAX "} GAS FEE
                        </label>
                        <div className="flex flex-col w-full space-y-1">
                            <div className="flex flex-row justify-between w-full font-bold">
                                <span>Total:</span>
                                <span>
                                    {selectedCurrency !== "eth" &&
                                        `${amount} ${selectedCurrency.toUpperCase()} + `}
                                    {formatNumberLength(
                                        formatUnits(
                                            freezedAmounts.total,
                                            network.nativeCurrency.decimals
                                        ),
                                        14
                                    )}{" "}
                                    {network.nativeCurrency.symbol}
                                </span>
                            </div>
                            <span className="ml-auto text-xs text-gray-500">
                                {formatCurrency(
                                    selectedCurrency !== "eth"
                                        ? freezedAmounts.totalInNativeCurrency +
                                              freezedAmounts.amountInNativeCurrency
                                        : freezedAmounts.totalInNativeCurrency,
                                    {
                                        currency: nativeCurrency,
                                        locale_info: localeInfo,
                                        showSymbol: true,
                                    }
                                )}
                            </span>
                            <span className="text-xs text-red-500">
                                {!hasBalance && "Insufficient balance"}
                            </span>
                        </div>
                    </div>
                </div>
                <ErrorMessage error={error} />
            </div>
        </PopupLayout>
    )
}

export default DepositConfirmPage
