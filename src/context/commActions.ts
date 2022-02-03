import { BigNumber } from "@ethersproject/bignumber"
import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import { ComplianceInfo } from "@blank/background/controllers/blank-deposit/infrastructure/IBlankDepositService"
import {
    CurrencyAmountPair,
    KnownCurrencies,
} from "@blank/background/controllers/blank-deposit/types"
import {
    Handlers,
    MessageTypes,
    RequestTypes,
    ResponseTypes,
    ResponseGetState,
    StateSubscription,
    SubscriptionMessageTypes,
    ResponseBlankCurrencyDepositsCount,
    TransportResponseMessage,
} from "@blank/background/utils/types/communication"
import { Messages, Origin, BackgroundActions } from "./commTypes"
import { ITokens, Token } from "@blank/background/controllers/erc-20/Token"
import { IBlankDeposit } from "@blank/background/controllers/blank-deposit/BlankDeposit"
import { SiteMetadata } from "@blank/provider/types"
import {
    TransactionAdvancedData,
    TransactionMeta,
} from "@blank/background/controllers/transactions/utils/types"
import { checkRedraw } from "./util/platform"
import log from "loglevel"
import { TransactionGasEstimation } from "@blank/background/controllers/transactions/TransactionController"
import {
    PopupTabs,
    UserSettings,
} from "@blank/background/controllers/PreferencesController"
import { DappRequestConfirmOptions } from "@blank/background/utils/types/ethereum"
import { TransactionFeeData } from "@blank/background/controllers/erc-20/transactions/SignedTransaction"

const handlers: Handlers = {}
let requestId = 0
let port: chrome.runtime.Port
export let isPortConnected = false
export let session: { origin: string; data: SiteMetadata } | null = null

// Run on init
// Some of these methods could be implemented in another "init" file since they're not exactly communication actions

/**
 * This checks if the instance is on a popup
 * The isPopup util checks the url, but the instance could be a window (e.g. permission request)
 *
 */
const isBrowserPopup = () => {
    return new Promise<boolean>((resolve) => {
        chrome.tabs.getCurrent((tab) => {
            if (!tab) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    })
}

/**
 * Connect ports
 */
const initPort = () => {
    // Open port
    port = chrome.runtime.connect({ name: Origin.EXTENSION })

    // Check for error
    port.onDisconnect.addListener(() => {
        const error = chrome.runtime.lastError
        if (error) {
            log.error("Port disconnected", error.message)
        } else {
            log.debug("Port disconnected.")
        }
    })

    // Add port message listener
    port.onMessage.addListener(
        (data: TransportResponseMessage<MessageTypes>): void => {
            const handler = handlers[data.id]

            if (!handler) {
                // Check for background actions
                if (data.id === BackgroundActions.CLOSE_WINDOW) {
                    window.close()
                } else {
                    log.error("Unknown response", data)
                }
                return
            }

            if (!handler.subscriber) {
                delete handlers[data.id]
            }

            if (data.subscription) {
                ;(handler.subscriber as Function)(data.subscription)
            } else if ("error" in data) {
                handler.reject(new Error(data.error))
            } else {
                handler.resolve(data.response)
            }
        }
    )

    chrome.tabs.query(
        { active: true, currentWindow: true },
        async (tabs: chrome.tabs.Tab[]) => {
            const isPopup = await isBrowserPopup()

            if (!isPopup || !tabs[0]) {
                session = null
                return
            }

            const { favIconUrl, url, title } = tabs[0]

            if (!url) {
                session = null
            } else {
                const { origin, hostname } = new URL(url)
                session = {
                    origin,
                    data: {
                        iconURL: favIconUrl || null,
                        name: title || hostname,
                    },
                }
            }
        }
    )

    isPortConnected = true
}

/**
 * Initialization function
 * Checks if the background is running before connecting the port
 */
export const initialize = () => {
    chrome.runtime &&
        chrome.runtime.sendMessage(
            { message: "isBlankInitialized" },
            (response: any) => {
                const error = chrome.runtime.lastError
                if (!response || error) {
                    setTimeout(initialize, 100)
                } else {
                    if (response.isBlankInitialized === true) {
                        if (!isPortConnected) {
                            initPort()
                        }
                    }
                }
            }
        )
}

// Run initialization function
initialize()

// Run platform check
checkRedraw()

/**
 * Send message generic
 *
 */
const sendMessage = <TMessageType extends MessageTypes>(
    message: TMessageType,
    request?: RequestTypes[TMessageType],
    subscriber?: (data: SubscriptionMessageTypes[TMessageType]) => void
): Promise<ResponseTypes[TMessageType]> => {
    return new Promise((resolve, reject): void => {
        const id = `${Date.now()}.${++requestId}`

        handlers[id] = { reject, resolve, subscriber }

        if (port) port.postMessage({ id, message, request: request || {} })
    })
}

/**
 * Creates a new account on the current keyring
 */
export const createAccount = async (name: string): Promise<AccountInfo> => {
    return sendMessage(Messages.ACCOUNT.CREATE, { name })
}

/**
 * Returns account json data to export
 * Encrypted with password
 *
 * @param address account address
 * @param password Encrypting password
 * @returns Exported account info on JSON format
 */
export const exportAccountJson = async (
    address: string,
    password: string,
    encryptPassword: string
): Promise<string> => {
    return sendMessage(Messages.ACCOUNT.EXPORT_JSON, {
        address,
        password,
        encryptPassword,
    })
}

/**
 * Returns account private key data to export
 * Encrypted with password
 *
 * @param address account address
 * @param password vault password
 * @returns Exported account info on JSON format
 */
export const exportAccountPrivateKey = async (
    address: string,
    password: string
): Promise<string> => {
    return sendMessage(Messages.ACCOUNT.EXPORT_PRIVATE_KEY, {
        address,
        password,
    })
}

/**
 * Imports an account using a json file
 *
 * @param importArgs Import data
 * @param name Imported account name
 * @returns Imported account info
 */
export const importAccountJson = async (
    importArgs: { input: string; password: string },
    name: string
): Promise<AccountInfo> => {
    return sendMessage(Messages.ACCOUNT.IMPORT_JSON, { importArgs, name })
}

/**
 * Imports an account using the private key
 *
 * @param importArgs Import data
 * @param name Imported account name
 * @returns Imported account info
 */
export const importAccountPrivateKey = async (
    importArgs: { privateKey: string },
    name: string
): Promise<AccountInfo> => {
    return sendMessage(Messages.ACCOUNT.IMPORT_PRIVATE_KEY, {
        importArgs,
        name,
    })
}

/**
 * Deletes the selected account
 *
 * It must be the last account on the accountsIndex,
 * otherwise it will break when creating a new account
 *
 * @param address account to be deleted
 */
export const removeAccount = async (address: string): Promise<boolean> => {
    return sendMessage(Messages.ACCOUNT.REMOVE, { address })
}

/**
 * Renames selected account
 *
 * @param address account address
 * @param name new name
 */
export const renameAccount = async (
    address: string,
    name: string
): Promise<boolean> => {
    return sendMessage(Messages.ACCOUNT.RENAME, { address, name })
}

/**
 * Updates selected account
 *
 * @param address address to be selected
 */
export const selectAccount = async (address: string): Promise<boolean> => {
    return sendMessage(Messages.ACCOUNT.SELECT, { address })
}

/**
 * Update last user activity time
 *
 * @param lastUserActivtyTime the new timeout
 */
export const setLastUserActiveTime = async (): Promise<void> => {
    return sendMessage(Messages.APP.SET_LAST_USER_ACTIVE_TIME)
}

/**
 * Set a custom time in minutes for the extension auto block
 *
 * @param idleTimeout the new timeout in minutes, should be greater than zero
 */
export const setIdleTimeout = async (idleTimeout: number): Promise<void> => {
    return sendMessage(Messages.APP.SET_IDLE_TIMEOUT, { idleTimeout })
}

/**
 * Returns the time in minutes for the extension auto block
 *
 */
export const getIdleTimeout = async (): Promise<number> => {
    return sendMessage(Messages.APP.GET_IDLE_TIMEOUT)
}

/**
 * Locks the current vault
 */
export const lockApp = async (): Promise<boolean> => {
    return sendMessage(Messages.APP.LOCK)
}

/**
 * Unlocks the current vault
 *
 * @param password user password
 */
export const unlockApp = async (password: string): Promise<boolean> => {
    return sendMessage(Messages.APP.UNLOCK, { password })
}

/**
 * Creates a new onboarding tab or focuses the current open one
 *
 */
export const returnToOnboarding = async (): Promise<void> => {
    return sendMessage(Messages.APP.RETURN_TO_ONBOARDING)
}

/**
 * It request the wallet seed phrase with the user password
 *
 * @returns The wallet seed phrase
 * @throws If the user password is invalid
 */
export const requestSeedPhrase = async (password: string): Promise<string> => {
    return sendMessage(Messages.WALLET.REQUEST_SEED_PHRASE, {
        password,
    })
}

/**
 * Verifies if the user has correctly completed the seed phrase challenge
 *
 * @param seedPhrase
 */
export const verifySeedPhrase = async (
    seedPhrase: string,
    password: string
): Promise<boolean> => {
    return sendMessage(Messages.WALLET.VERIFY_SEED_PHRASE, {
        password,
        seedPhrase,
    })
}

/**
 * Method to mark setup process as complete and to fire a notification.
 *
 */
export const completeSetup = async (): Promise<void> => {
    return sendMessage(Messages.WALLET.SETUP_COMPLETE, {})
}

/**
 * Opens the tab-view to reset the wallet using a seed phrase
 *
 */
export const openReset = async (): Promise<void> => {
    return sendMessage(Messages.APP.OPEN_RESET)
}

/**
 * Verifies if the user's password is correct
 *
 * @param password user's password
 */
export const verifyPassword = async (password: string): Promise<boolean> => {
    return sendMessage(Messages.PASSWORD.VERIFY, {
        password,
    })
}

/**
 * Gets the current blank app state
 *
 * @returns Background state
 */
export const getState = async (): Promise<ResponseGetState> => {
    return sendMessage(Messages.STATE.GET)
}

/**
 * Resolves the address of an ENS name
 *
 * @returns address or null
 */
export const resolveEnsName = async (name: string): Promise<string | null> => {
    return sendMessage(Messages.ENS.RESOLVE_NAME, {
        name,
    })
}

/**
 * Looks up the ENS name of an address
 *
 * @returns ens name or null
 */
export const lookupAddressEns = async (
    address: string
): Promise<string | null> => {
    return sendMessage(Messages.ENS.LOOKUP_ADDRESS, {
        address,
    })
}

/**
 * Sends ethereum or the network native currency
 *
 * @param to recipient
 * @param feeData gas fee data
 * @param value amount
 */
export const sendEther = async (
    to: string,
    feeData: TransactionFeeData,
    value: BigNumber,
    advancedData: TransactionAdvancedData
): Promise<string> => {
    return sendMessage(Messages.TRANSACTION.SEND_ETHER, {
        to,
        feeData,
        value,
        advancedData,
    })
}

/**
 * Adds a new unapproved send transaction
 *
 * @param address The token address (0x0 for the Network native currency)
 * @param to recipient
 * @param feeData gas fee data
 * @param value amount
 */
export const addNewSendTransaction = async (
    address: string,
    to: string,
    feeData: TransactionFeeData,
    value: BigNumber
): Promise<TransactionMeta> => {
    return sendMessage(Messages.TRANSACTION.ADD_NEW_SEND_TRANSACTION, {
        address,
        to,
        value,
        feeData,
    })
}

/**
 * Updates the gas on an existing unapproved Send transaction
 *
 * @param transactionId The transaction id
 * @param feeData gas fee data to update
 */
export const updateSendTransactionGas = async (
    transactionId: string,
    feeData: TransactionFeeData
): Promise<void> => {
    return sendMessage(Messages.TRANSACTION.UPDATE_SEND_TRANSACTION_GAS, {
        transactionId,
        feeData,
    })
}

/**
 * It approves an existing unapproved Send transaction
 *
 * @param transactionId The transaction id
 */
export const approveSendTransaction = async (
    transactionId: string
): Promise<void> => {
    return sendMessage(Messages.TRANSACTION.APPROVE_SEND_TRANSACTION, {
        transactionId,
    })
}

/**
 * It awaits for an already submitted Send transaction result
 *
 * @param transactionId The transaction id
 * @returns The transaction hash
 */
export const getSendTransactionResult = async (
    transactionId: string
): Promise<string> => {
    return sendMessage(Messages.TRANSACTION.GET_SEND_TRANSACTION_RESULT, {
        transactionId,
    })
}

/**
 * It calculates a Send transaction gas limit
 *
 * @param address The token contract address
 * @param to The `to` parameter
 * @param value The value to transfer
 * @returns The send estimated gas limit
 */
export const getSendTransactionGasLimit = async (
    address: string,
    to: string,
    value: BigNumber
): Promise<TransactionGasEstimation> => {
    return sendMessage(
        Messages.TRANSACTION.CALCULATE_SEND_TRANSACTION_GAS_LIMIT,
        {
            address,
            to,
            value,
        }
    )
}

/**
 * It obtains the current network latest gas price
 */
export const getLatestGasPrice = async (): Promise<BigNumber> => {
    return sendMessage(Messages.TRANSACTION.GET_LATEST_GAS_PRICE)
}

/**
 * Get all the erc20 tokens method
 *
 */
export const getTokens = (): Promise<ITokens> => {
    return sendMessage(Messages.TOKEN.GET_TOKENS, {})
}

/**
 * Get all the erc20 tokens that the user added method
 *
 */
export const getUserToken = (): Promise<ITokens> => {
    return sendMessage(Messages.TOKEN.GET_USER_TOKENS, {})
}

/**
 * get erc20 token method
 *
 * @param tokenAddress erc20 token address
 */
export const getToken = (tokenAddress: string): Promise<Token> => {
    return sendMessage(Messages.TOKEN.GET_TOKEN, {
        tokenAddress,
    })
}

/**
 * Get balance for a single token address
 *
 * @returns token balance for that account
 */
export const getTokenBalance = (
    tokenAddress: string,
    account: string
): Promise<BigNumber> => {
    return sendMessage(Messages.TOKEN.GET_BALANCE, {
        tokenAddress,
        account,
    })
}

/**
 * Add custom erc20 token method
 *
 * @param address erc20 token address
 * @param name erc20 token name
 * @param symbol erc20 token symbol
 * @param decimals erc20 token decimals
 */
export const addCustomToken = async (
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logo: string,
    type: string
): Promise<void | void[]> => {
    return sendMessage(Messages.TOKEN.ADD_CUSTOM_TOKEN, {
        address,
        name,
        symbol,
        decimals,
        logo,
        type,
    })
}

/**
 * Add custom erc20 tokens method
 *
 * @param tokens erc20 tokens array
 */
export const addCustomTokens = async (
    tokens: Token[]
): Promise<void | void[]> => {
    return sendMessage(Messages.TOKEN.ADD_CUSTOM_TOKENS, { tokens })
}

/**
 * Delete a custom erc20 tokens method
 *
 * @param address of the ERC20 token to delete
 */
export const deleteCustomToken = async (address: string): Promise<void> => {
    return sendMessage(Messages.TOKEN.DELETE_CUSTOM_TOKEN, { address })
}

/**
 * Sends erc20 token
 *
 * @param tokenAddress erc20 token address
 * @param to recipient
 * @param feeData gas fee data
 * @param value amount
 */
export const sendToken = async (
    tokenAddress: string,
    to: string,
    feeData: TransactionFeeData,
    value: BigNumber,
    advancedData: TransactionAdvancedData
): Promise<string> => {
    return sendMessage(Messages.TOKEN.SEND_TOKEN, {
        tokenAddress,
        to,
        value,
        feeData,
        advancedData,
    })
}

/**
 * Searches inside the assets list for tokens that matches the criteria
 *
 * @param query The user input query to search for (address, name, symbol)
 */
export const searchTokenInAssetsList = async (
    query: string,
    exact?: boolean
): Promise<Token[]> => {
    return sendMessage(Messages.TOKEN.SEARCH_TOKEN, {
        query,
        exact,
    })
}

/**
 * Search the token in the blockchain
 *
 * @param tokenAddress erc20 token address
 */
export const populateTokenData = async (
    tokenAddress: string
): Promise<Token> => {
    return sendMessage(Messages.TOKEN.POPULATE_TOKEN_DATA, {
        tokenAddress,
    })
}

/**
 * Creates a new BlockWallet
 *
 * @param password user password
 * @returns vault seed phrase
 */
export const createWallet = async (password: string): Promise<void> => {
    return sendMessage(Messages.WALLET.CREATE, { password })
}

/**
 * Imports the user's wallet to blank
 *
 * @param password user password
 * @param seedPhrase vault seed phrase
 */
export const importWallet = async (
    password: string,
    seedPhrase: string
): Promise<boolean> => {
    return sendMessage(Messages.WALLET.IMPORT, { password, seedPhrase })
}

/**
 * Reset the wallet with a seed phrase
 *
 * @param password user password
 * @param seedPhrase vault seed phrase
 */
export const resetWallet = async (
    password: string,
    seedPhrase: string
): Promise<boolean> => {
    return sendMessage(Messages.WALLET.RESET, { password, seedPhrase })
}

/**
 * It makes a Blank deposit
 *
 * @param pair The currency/amount pair
 * @param feeData gas fee data
 */
export const makeBlankDeposit = async (
    pair: CurrencyAmountPair,
    feeData: TransactionFeeData,
    unlimitedAllowance: boolean = false
): Promise<string> => {
    return sendMessage(Messages.BLANK.DEPOSIT, {
        pair,
        feeData,
        unlimitedAllowance,
    })
}

/**
 * Obtains the underlying token allowance of a deposit contract instance
 *
 * @param pair The pair associated to the contract instance
 * @returns The specified pair instance underlying token allowance
 */
export const getDepositInstanceAllowance = async (pair: CurrencyAmountPair) => {
    return sendMessage(Messages.BLANK.GET_INSTANCE_ALLOWANCE, {
        pair,
    })
}

/**
 * It makes a Blank withdrawal
 *
 * @param pair The currency/amount pair
 * @param address The withdrawal recipient (Defaults to selected address)
 */
export const makeBlankWithdrawal = async (
    pair: CurrencyAmountPair,
    accountAddressOrIndex?: string | number
): Promise<string> => {
    return sendMessage(Messages.BLANK.WITHDRAW, {
        pair,
        accountAddressOrIndex,
    })
}

/**
 * It returns compliance information for the specified deposit
 *
 * @param id The Deposit Id
 */
export const getDepositComplianceInformation = async (
    id: string
): Promise<ComplianceInfo> => {
    return sendMessage(Messages.BLANK.COMPLIANCE, { id })
}

/**
 * It returns the unspent deposit count for the specified pair
 *
 * @param pair The currency/amount pair
 */
export const getDepositsCount = async (
    pair: CurrencyAmountPair
): Promise<number> => {
    return sendMessage(Messages.BLANK.PAIR_DEPOSITS_COUNT, { pair })
}

/**
 * It returns the unspent deposit count for the specified pair
 *
 * @param pair The currency/amount pair
 */
export const getCurrencyDepositsCount = async (
    currency: KnownCurrencies
): Promise<ResponseBlankCurrencyDepositsCount> => {
    return sendMessage(Messages.BLANK.CURRENCY_DEPOSITS_COUNT, { currency })
}

/**
 * It returns the list of unspent deposits
 */
export const getUnspentDeposits = async (): Promise<IBlankDeposit[]> => {
    return sendMessage(Messages.BLANK.GET_UNSPENT_DEPOSITS)
}

/**
 * It obtains the Deposit formatted note
 *
 * @param id The Deposit id
 */
export const getDepositFormattedNote = async (id: string): Promise<string> => {
    return sendMessage(Messages.BLANK.GET_DEPOSIT_NOTE_STRING, { id })
}

/**
 * It returns the withdrawal operation fees
 */
export const getWithdrawalFees = async (pair: CurrencyAmountPair) => {
    return sendMessage(Messages.BLANK.GET_WITHDRAWAL_FEES, { pair })
}

/**
 * Updates the popup tab to focus when opening the popup next time
 */
export const updatePopupTab = async (popupTab: PopupTabs): Promise<void> => {
    return sendMessage(Messages.APP.UPDATE_POPUP_TAB, {
        popupTab,
    })
}

/**
 * It forces the deposit reconstruction for the current network
 */
export const forceDepositsImport = async () => {
    return sendMessage(Messages.BLANK.FORCE_DEPOSITS_IMPORT)
}

/**
 * It checks for possible spent notes and updates their internal state
 */
export const updateNotesSpentState = async () => {
    return sendMessage(Messages.BLANK.UPDATE_SPENT_NOTES)
}

/**
 * hasDepositedFromAddress
 *
 * @returns Whether or not the user has made at least one deposit from this address in the past
 */
export const hasDepositedFromAddress = async (
    withdrawAddress: string,
    pair?: CurrencyAmountPair
) => {
    return sendMessage(Messages.BLANK.HAS_DEPOSITED_FROM_ADDRESS, {
        pair,
        withdrawAddress,
    })
}

/**
 * It returns the date of the latest deposit made
 * for the specified currency/amount pair
 *
 * @param pair The currency/amount pair
 */
export const getLatestDepositDate = async (
    pair: CurrencyAmountPair
): Promise<Date> => {
    return sendMessage(Messages.BLANK.GET_LATEST_DEPOSIT_DATE, { pair })
}

/**
 * Creates a new site with permissions
 *
 */
export const addNewSiteWithPermissions = (
    accounts: string[],
    origin: string,
    siteMetadata: SiteMetadata
) => {
    return sendMessage(Messages.PERMISSION.ADD_NEW, {
        accounts,
        origin,
        siteMetadata,
    })
}

/**
 * Adds a new unapproved deposit transaction
 *
 * @param currencyAmountPair The currency amount pair
 * @param feeData gas fee data
 */
export const addNewDepositTransaction = async (
    currencyAmountPair: CurrencyAmountPair,
    feeData: TransactionFeeData
): Promise<TransactionMeta> => {
    return sendMessage(Messages.BLANK.ADD_NEW_DEPOSIT_TRANSACTION, {
        currencyAmountPair,
        feeData,
    })
}

/**
 * Confirms a pending permission request
 *
 */
export const confirmPermission = (id: string, accounts: string[] | null) => {
    return sendMessage(Messages.PERMISSION.CONFIRM, {
        id,
        accounts,
    })
}

/**
 * Confirms or rejects the selected dapp request
 *
 */
export const confirmDappRequest = (
    id: string,
    isConfirmed: boolean,
    confirmOptions?: DappRequestConfirmOptions
): Promise<void> => {
    return sendMessage(Messages.DAPP.CONFIRM_REQUEST, {
        id,
        isConfirmed,
        confirmOptions,
    })
}

/**
 * Updates the gas on an existing unapproved Deposit transaction
 *
 * @param transactionId The transaction id
 * @param feeData gas fee data to update
 */
export const updateDepositTransactionGas = async (
    transactionId: string,
    feeData: TransactionFeeData
): Promise<void> => {
    return sendMessage(Messages.BLANK.UPDATE_DEPOSIT_TRANSACTION_GAS, {
        transactionId,
        feeData,
    })
}

/**
 * Returns the sites the account is allowed to connect to
 *
 */
export const getAccountPermissions = (account: string) => {
    return sendMessage(Messages.PERMISSION.GET_ACCOUNT_PERMISSIONS, {
        account,
    })
}

/**
 * It approves an existing unapproved Deposit transaction
 *
 * @param depositId The deposit id
 */
export const approveDepositTransaction = async (
    transactionId: string
): Promise<void> => {
    return sendMessage(Messages.BLANK.APPROVE_DEPOSIT_TRANSACTIION, {
        transactionId,
    })
}

/**
 * Remove account from a single site
 * If the site has no accounts left, then deletes the site
 *
 */
export const removeAccountFromSite = (origin: string, account: string) => {
    return sendMessage(Messages.PERMISSION.REMOVE_ACCOUNT_FROM_SITE, {
        origin,
        account,
    })
}

/**
 * It awaits for an already submitted Deposit transaction result
 *
 * @param transactionId The transaction id
 * @returns The transaction hash
 */
export const getDepositTransactionResult = async (
    transactionId: string
): Promise<string> => {
    return sendMessage(Messages.BLANK.GET_DEPOSIT_TRANSACTION_RESULT, {
        transactionId,
    })
}

/**
 * Updates permissions for a specific site
 * If accounts is an empty array or null, deletes the site.
 *
 */
export const updateSitePermissions = (
    origin: string,
    accounts: string[] | null
) => {
    return sendMessage(Messages.PERMISSION.UPDATE_SITE_PERMISSIONS, {
        origin,
        accounts,
    })
}

/**
 * It calculates an Approve transaction gas limit
 *
 * @returns The Approve estimated gas limit
 */
export const getApproveTransactionGasLimit = async (
    tokenAddress: string,
    spender: string = "deposit",
    amount: BigNumber | "UNLIMITED" = "UNLIMITED"
): Promise<TransactionGasEstimation> => {
    return sendMessage(
        Messages.TRANSACTION.CALCULATE_APPROVE_TRANSACTION_GAS_LIMIT,
        {
            tokenAddress,
            spender,
            amount,
        }
    )
}

/**
 * It calculates a Deposit transaction gas limit
 *
 * @param currencyAmountPair The currency amount pair
 * @returns The Deposit estimated gas limit
 */
export const getDepositTransactionGasLimit = async (
    currencyAmountPair: CurrencyAmountPair
): Promise<TransactionGasEstimation> => {
    return sendMessage(Messages.BLANK.CALCULATE_DEPOSIT_TRANSACTION_GAS_LIMIT, {
        currencyAmountPair,
    })
}

/**
 * Subscribes to state updates
 *
 * @param cb state update handler
 */
export const subscribeState = async (
    cb: (state: StateSubscription) => void
): Promise<boolean> => {
    return sendMessage(Messages.STATE.SUBSCRIBE, undefined, cb)
}

/**
 * Performs network change to the selected one.
 * @param networkName
 */
export const changeNetwork = async (networkName: string): Promise<boolean> => {
    return sendMessage(Messages.NETWORK.CHANGE, { networkName })
}

/**
 * Performs network change to the selected one.
 * @param networkName
 */
export const setShowTestNetworks = async (
    showTestNetworks: boolean
): Promise<boolean> => {
    return sendMessage(Messages.NETWORK.SET_SHOW_TEST_NETWORKS, {
        showTestNetworks,
    })
}

/**
 * Performs transaction confirm with specific transaction meta.
 * @param transactionMeta
 */
export const confirmTransaction = async (
    transactionId: string,
    feeData: TransactionFeeData,
    advancedData: TransactionAdvancedData
) => {
    return sendMessage(Messages.TRANSACTION.CONFIRM, {
        id: transactionId,
        feeData,
        advancedData,
    })
}

/**
 * Rejects the transaction specified by id.
 * @param transactionId
 */
export const rejectTransaction = async (transactionId: string) => {
    return sendMessage(Messages.TRANSACTION.REJECT, { transactionId })
}

/**
 * Remove all entries in the book
 *
 */
export const addressBookClear = async () => {
    return sendMessage(Messages.ADDRESS_BOOK.CLEAR, {})
}

/**
 * Remove a contract entry by address
 *
 * @param address - Recipient address to delete
 */
export const addressBookDelete = async (address: string) => {
    return sendMessage(Messages.ADDRESS_BOOK.DELETE, { address })
}

/**
 * Add or update a contact entry by address
 *
 * @param address - Recipient address to add or update
 * @param name - Nickname to associate with this address
 * @param note - User's note about address
 * @returns - Boolean indicating if the address was successfully set
 */
export const addressBookSet = async (
    address: string,
    name: string,
    note: string
) => {
    return sendMessage(Messages.ADDRESS_BOOK.SET, { address, name, note })
}

/**
 * Get the contacts
 *
 * @returns - A map with the entries
 */
export const addressBookGet = async () => {
    return sendMessage(Messages.ADDRESS_BOOK.GET, {})
}

/**
 * Get the contacts
 *
 * @param address - Recipient address to search
 *
 * @returns - A address book entry
 */
export const addressBookByAddress = async (address: string) => {
    return sendMessage(Messages.ADDRESS_BOOK.GET_BY_ADDRESS, { address })
}

/**
 * Get the recent addresses with which the wallet has interacted
 *
 * @param limit - Optional. The maximun number of recent address to return.
 *
 * @returns - A map with the entries
 */
export const addressBookGetRecentAddresses = async (limit?: number) => {
    return sendMessage(Messages.ADDRESS_BOOK.GET_RECENT_ADDRESSES, { limit })
}

/**
 * Stores the user settings.
 * @param settings Object containing settings and values to store.
 */
export const setUserSettings = async (settings: UserSettings) => {
    return sendMessage(Messages.APP.SET_USER_SETTINGS, { settings })
}

/**
 * Get the contacts
 *
 * @param address - Recipient address to search
 *
 * @returns - A address book entry
 */
export const getNextNonce = async (address: string) => {
    return sendMessage(Messages.TRANSACTION.GET_NEXT_NONCE, { address })
}

/**
 * Dismisses the welcome to the wallet message
 */
export const dismissWelcomeMessage = async (): Promise<boolean> => {
    return sendMessage(Messages.WALLET.DISMISS_WELCOME_MESSAGE, {})
}
