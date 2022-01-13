import { BigNumber } from "ethers"
import { useBlankState } from "../background/backgroundHooks"
import { useGasPriceData } from "./useGasPriceData"
import { useSelectedNetwork } from "./useSelectedNetwork"

export const useUnapprovedTransaction = () => {
    const { unapprovedTransactions } = useBlankState()!
    const { isEIP1559Compatible } = useSelectedNetwork()
    const { gasPricesLevels } = useGasPriceData()

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
                      gasPricesLevels.average.gasPrice
              )
            : undefined,
        //EIP-1559
        maxPriorityFeePerGas: isEIP1559Compatible
            ? BigNumber.from(
                  transaction?.transactionParams.maxPriorityFeePerGas ??
                      gasPricesLevels.average.maxPriorityFeePerGas
              )
            : undefined,
        maxFeePerGas: isEIP1559Compatible
            ? BigNumber.from(
                  transaction?.transactionParams.maxFeePerGas ??
                      gasPricesLevels.average.maxFeePerGas
              )
            : undefined,
    }

    return { transactionCount, transactionId, transaction, params }
}
