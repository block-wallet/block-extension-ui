import { BigNumber } from "ethers"
import { useBlankState } from "../background/backgroundHooks"
import { useGasPriceData } from "./useGasPriceData"

export const useUnapprovedTransaction = () => {
    const { unapprovedTransactions } = useBlankState()!
    const { isEIP1559Compatible, gasPrices } = useGasPriceData()

    // Gets first unapproved transaction
    const transactions = Object.keys(unapprovedTransactions)

    const transaction = Object.values(unapprovedTransactions)[0]
    const transactionId = transactions[0]
    const transactionCount = transactions.length

    const params = {
        ...transaction?.transactionParams,
        value: BigNumber.from(transaction?.transactionParams.value ?? "0"),
        gasLimit: BigNumber.from(
            transaction?.transactionParams.gasLimit ?? "0"
        ),
        //Legacy
        gasPrice: !isEIP1559Compatible
            ? BigNumber.from(
                transaction?.transactionParams.gasPrice ??
                gasPrices.average.gasPrice
            )
            : undefined,
        //EIP-1559
        maxPriorityFeePerGas: isEIP1559Compatible
            ? BigNumber.from(
                transaction?.transactionParams.maxPriorityFeePerGas ??
                gasPrices.average.maxPriorityFeePerGas
            )
            : undefined,
        maxFeePerGas: isEIP1559Compatible
            ? BigNumber.from(
                transaction?.transactionParams.maxFeePerGas ??
                gasPrices.average.maxFeePerGas
            )
            : undefined,
    }

    return { transactionCount, transactionId, transaction, params }
}
