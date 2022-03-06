import { BigNumber } from "ethers"
import { useBlankState } from "../../context/background/backgroundHooks"
import { formatCurrency, toCurrencyAmount } from "../formatCurrency"

const useCurrencyFromatter = () => {
    const state = useBlankState()!
    const format = (
        balance: BigNumber,
        tokenSymbol: string,
        decimals: number
    ) => {
        const currencyAmount = toCurrencyAmount(
            balance || BigNumber.from(0),
            state.exchangeRates[tokenSymbol],
            decimals
        )
        return formatCurrency(currencyAmount, {
            currency: state.nativeCurrency,
            locale_info: state.localeInfo,
            returnNonBreakingSpace: true,
            showSymbol: true,
        })
    }
    return { format }
}

export default useCurrencyFromatter
