import { TransactionFeeData } from "@blank/background/controllers/erc-20/transactions/SignedTransaction"
import { Rates } from "@blank/background/controllers/ExchangeRatesController"
import { BigNumber } from "ethers"
import { DEFAULT_TRANSACTION_GAS_PERCENTAGE_THRESHOLD } from "./constants"
import { formatCurrency, toCurrencyAmount } from "./formatCurrency"

interface GasFeesCalculation {
    minValue: BigNumber
    maxValue: BigNumber
    minValueNativeCurrency?: string
    maxValueNativeCurrency?: string
}

interface CalculateFeeOptions {
    exchangeRates: Rates
    networkNativeCurrency: {
        symbol: string
        decimals: number
    }
    localeInfo: {
        currency: string
        language: string
    }
}

const calculateTransactionGas = (
    gasLimit: BigNumber,
    gasPrice: BigNumber | undefined,
    maxFeePerGas: BigNumber
): BigNumber => {
    return BigNumber.from(gasLimit!.mul(gasPrice ?? maxFeePerGas!))
}

const calculateGasPricesFromTransactionFees = (
    gasFees: TransactionFeeData,
    baseFee: BigNumber,
    conversionOptions?: CalculateFeeOptions
): GasFeesCalculation => {
    // MinValue: (baseFee + tip) * gasLimit
    // We assume that the baseFee could at most be reduced 25% in next 2 blocks so for calculating the min value we apply that reduction.

    // 25% of BaseFee => (baseFee * 25) / 100
    const percentage = baseFee.mul(BigNumber.from(25)).div(BigNumber.from(100))
    const minBaseFee = baseFee.sub(percentage)
    const minValue = minBaseFee
        .add(gasFees.maxPriorityFeePerGas!)
        .mul(gasFees.gasLimit!)

    // MaxValue: maxFeePerGas * gasLimit
    const maxValue = gasFees.maxFeePerGas!.mul(gasFees.gasLimit!)

    let minValueNativeCurrency = undefined
    let maxValueNativeCurrency = undefined

    if (conversionOptions) {
        const {
            exchangeRates,
            networkNativeCurrency,
            localeInfo,
        } = conversionOptions
        minValueNativeCurrency = formatCurrency(
            toCurrencyAmount(
                minValue.lt(maxValue) ? minValue : maxValue,
                exchangeRates[networkNativeCurrency.symbol],
                networkNativeCurrency!.decimals
            ),
            {
                currency: localeInfo.currency,
                locale_info: localeInfo.language,
                showCurrency: false,
                showSymbol: true,
                precision: 2,
            }
        )

        maxValueNativeCurrency = formatCurrency(
            toCurrencyAmount(
                minValue.gt(maxValue) ? minValue : maxValue,
                exchangeRates[networkNativeCurrency!.symbol],
                networkNativeCurrency.decimals
            ),
            {
                currency: localeInfo.currency,
                locale_info: localeInfo.language,
                showCurrency: false,
                showSymbol: true,
                precision: 2,
            }
        )
    }

    return {
        minValue,
        maxValue,
        minValueNativeCurrency,
        maxValueNativeCurrency,
    }
}

const estimatedGasExceedsBaseLowerThreshold = (
    baseMinGas: BigNumber,
    estimatedGas: BigNumber,
    percentage = DEFAULT_TRANSACTION_GAS_PERCENTAGE_THRESHOLD
): boolean => {
    const dif = baseMinGas
        .mul(BigNumber.from(percentage))
        .div(BigNumber.from(100))
    if (baseMinGas.sub(dif).gte(estimatedGas)) {
        return true
    }
    return false
}

const estimatedGasExceedsBaseHigherThreshold = (
    baseMaxGas: BigNumber,
    estimatedGas: BigNumber,
    percentage = DEFAULT_TRANSACTION_GAS_PERCENTAGE_THRESHOLD
): boolean => {
    const dif = baseMaxGas
        .mul(BigNumber.from(percentage))
        .div(BigNumber.from(100))
    if (baseMaxGas.add(dif).lte(estimatedGas)) {
        return true
    }
    return false
}

export {
    calculateGasPricesFromTransactionFees,
    estimatedGasExceedsBaseLowerThreshold,
    estimatedGasExceedsBaseHigherThreshold,
    calculateTransactionGas,
}
