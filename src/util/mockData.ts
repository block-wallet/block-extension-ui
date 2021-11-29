import { parseEther } from "ethers/lib/utils"
import { TransactionMeta } from "@blank/background/controllers/transactions/utils/types"
import { TransactionCategories, TransactionStatus } from "../context/commTypes"

export const mockTransactions: TransactionMeta[] = [
    {
        id: "0",
        status: TransactionStatus.CONFIRMED,
        transactionParams: { value: parseEther("1.2") },
        time: 100000,
        loadingGasValues: true,
        blocksDropCount: 0,
        transactionCategory: TransactionCategories.SENT_ETHER,
    },
    {
        id: "1",
        status: TransactionStatus.CONFIRMED,
        transactionParams: {},
        time: 100000,
        loadingGasValues: true,
        blocksDropCount: 0,
        transactionCategory: TransactionCategories.CONTRACT_INTERACTION,
    },
    {
        id: "2",
        status: TransactionStatus.CONFIRMED,
        transactionParams: { value: parseEther("2.43") },
        time: 100000,
        loadingGasValues: true,
        blocksDropCount: 0,
        transactionCategory: TransactionCategories.INCOMING,
    },
    {
        id: "3",
        status: TransactionStatus.CONFIRMED,
        transactionParams: {},
        time: 100000,
        loadingGasValues: true,
        blocksDropCount: 0,
        transactionCategory: TransactionCategories.TOKEN_METHOD_TRANSFER,
    },
    {
        id: "4",
        status: TransactionStatus.CONFIRMED,
        transactionParams: {},
        time: 100000,
        loadingGasValues: true,
        blocksDropCount: 0,
        transactionCategory: TransactionCategories.BLANK_DEPOSIT,
    },
    {
        id: "5",
        status: TransactionStatus.CONFIRMED,
        transactionParams: {},
        time: 100000,
        loadingGasValues: true,
        blocksDropCount: 0,
        transactionCategory: TransactionCategories.BLANK_WITHDRAWAL,
    },
]
