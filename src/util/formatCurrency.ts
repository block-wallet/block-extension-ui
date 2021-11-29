import { BigNumber } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import { DEFAULT_DECIMALS } from "./constants"
import { convertAmount } from "./convertAmount"

const DEFAULT_LOCALE_INFO = "en-US"
const DEFAULT_CURRENCY = "USD"
const DEFAULT_DECIMAL_PRECISION = 2

const CURRENCY_SYMBOLS: {[key:string]: string} = {
    "USD": "$",
}

export type formatCurrencyOptions = {
    locale_info?: string
    currency?: string
    precision?: number
    showSymbol?: boolean
    showCurrency?: boolean
    returnNonBreakingSpace?: boolean // whether or not to return a non-breaking space, if the amount is falsy
}

export function toCurrencyAmount(
    amount: BigNumber,
    exchangeRate: number,
    decimals: number = DEFAULT_DECIMALS // Ether default
): number {
    return parseFloat(
        formatUnits(convertAmount(amount, exchangeRate), decimals)
    )
}

export function formatCurrency(
    currencyAmount: number,
    options?: formatCurrencyOptions
): string {
    if (options?.returnNonBreakingSpace && !currencyAmount) {
        return "\u200b"
    }

    if (!currencyAmount) {
        return ""
    }

    const locale_info: string = options?.locale_info || DEFAULT_LOCALE_INFO
    const currency: string =
        options?.currency?.toLocaleUpperCase() || DEFAULT_CURRENCY
    const precision: number = options?.precision || DEFAULT_DECIMAL_PRECISION

    const showCurrency = options?.showCurrency ?? true
    const symbol = options?.showSymbol && currency in CURRENCY_SYMBOLS ? CURRENCY_SYMBOLS[currency] : ""

    const formatter = new Intl.NumberFormat(locale_info, {
        style: "decimal",
        currency: currency,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    })

    return `${symbol}${formatter.format(currencyAmount)} ${showCurrency ? currency : ""}`
}
