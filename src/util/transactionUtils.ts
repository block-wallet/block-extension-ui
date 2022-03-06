import { TransactionMeta } from "@blank/background/controllers/transactions/utils/types"
import { TransactionStatus } from "../context/commTypes"

export interface RichedTransactionMeta extends TransactionMeta {
    //Dynamically calculated using this transaction status and comparing the nonce with other transactions.
    isQueued?: boolean
    // Allows to force the status of a transaction to be dropped
    forceDrop?: boolean
}

export const flagQueuedTransactions = (
    pendingTransactions: TransactionMeta[]
): RichedTransactionMeta[] => {
    if (!pendingTransactions || pendingTransactions.length === 0) {
        return pendingTransactions
    }
    const lowestPendingNonce = pendingTransactions
        .filter((transaction) => {
            return transaction.status === TransactionStatus.SUBMITTED
        })
        .reduce((lowest, current) => {
            const currentNonce = current.transactionParams.nonce || -1
            if (lowest === -1 || currentNonce < lowest) {
                return currentNonce
            }
            return lowest
        }, -1)

    return pendingTransactions.map((transaction) => {
        const transactionNonce = transaction.transactionParams.nonce || -1
        const isPendingState =
            transaction.status === TransactionStatus.SUBMITTED
        return {
            ...transaction,
            isQueued: isPendingState && transactionNonce > lowestPendingNonce,
        }
    })
}
