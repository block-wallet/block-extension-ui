enum ACCOUNT {
    CREATE = "CREATE_ACCOUNT",
    EXPORT_JSON = "EXPORT_ACCOUNT_JSON",
    EXPORT_PRIVATE_KEY = "EXPORT_ACCOUNT_PK",
    IMPORT_JSON = "IMPORT_ACCOUNT_JSON",
    IMPORT_PRIVATE_KEY = "IMPORT_ACCOUNT_PK",
    REMOVE = "REMOVE_ACCOUNT",
    RENAME = "RENAME_ACCOUNT",
    SELECT = "SELECT_ACCOUNT",
}

enum APP {
    LOCK = "LOCK_APP",
    UNLOCK = "UNLOCK_APP",
    GET_IDLE_TIMEOUT = "GET_IDLE_TIMEOUT",
    SET_IDLE_TIMEOUT = "SET_IDLE_TIMEOUT",
    SET_LAST_USER_ACTIVE_TIME = "SET_LAST_USER_ACTIVE_TIME",
    RETURN_TO_ONBOARDING = "RETURN_TO_ONBOARDING",
    OPEN_RESET = "OPEN_RESET",
    SET_USER_SETTINGS = "SET_USER_SETTINGS",
    UPDATE_POPUP_TAB = "UPDATE_POPUP_TAB",
}

enum BACKGROUND {
    ACTION = "ACTION",
}

enum BLANK {
    DEPOSIT = "DEPOSIT",
    ADD_NEW_DEPOSIT_TRANSACTION = "DEPOSIT_ADD_UNNAPROVE_TRANSACTION",
    UPDATE_DEPOSIT_TRANSACTION_GAS = "UPDATE_DEPOSIT_TRANSACTION_GAS",
    APPROVE_DEPOSIT_TRANSACTIION = "APPROVE_DEPOSIT_TRANSACTIION",
    GET_DEPOSIT_TRANSACTION_RESULT = "GET_DEPOSIT_TRANSACTION_RESULT",
    CALCULATE_DEPOSIT_TRANSACTION_GAS_LIMIT = "CALCULATE_DEPOSIT_TRANSACTION_GAS_LIMIT",
    WITHDRAW = "WITHDRAW",
    COMPLIANCE = "COMPLIANCE",
    PAIR_DEPOSITS_COUNT = "PAIR_DEPOSITS_COUNT",
    CURRENCY_DEPOSITS_COUNT = "CURRENCY_DEPOSITS_COUNT",
    GET_UNSPENT_DEPOSITS = "GET_UNSPENT_DEPOSITS",
    GET_DEPOSIT_NOTE_STRING = "GET_DEPOSIT_NOTE_STRING",
    UPDATE_SPENT_NOTES = "UPDATE_SPENT_NOTES",
    GET_WITHDRAWAL_FEES = "GET_WITHDRAWAL_GAS_COST",
    FORCE_DEPOSITS_IMPORT = "FORCE_DEPOSITS_IMPORT",
    HAS_DEPOSITED_FROM_ADDRESS = "HAS_DEPOSITED_FROM_ADDRESS",
    GET_INSTANCE_ALLOWANCE = "GET_INSTANCE_ALLOWANCE",
    GET_LATEST_DEPOSIT_DATE = "GET_LATEST_DEPOSIT_DATE",
}

enum DAPP {
    CONFIRM_REQUEST = "CONFIRM_DAPP_REQUEST",
}

enum EXTERNAL {
    SET_SITE_DATA = "SET_SITE_DATA",
    REQUEST = "EXTERNAL_REQUEST",
    EVENT_SUBSCRIPTION = "EVENT_SUBSCRIPTION",
}

enum NETWORK {
    CHANGE = "NETWORK_CHANGE",
    SET_SHOW_TEST_NETWORKS = "SHOW_TEST_NETWORKS",
    ADD_NETWORK = "ADD_NETWORK",
}

enum PASSWORD {
    VERIFY = "VERIFY_PASSWORD",
    CHANGE = "CHANGE_PASSWORD",
}

enum PERMISSION {
    ADD_NEW = "ADD_NEW_SITE_PERMISSIONS",
    CONFIRM = "CONFIRM_PERMISSION_REQUEST",
    GET_ACCOUNT_PERMISSIONS = "GET_ACCOUNT_PERMISSIONS",
    REMOVE_ACCOUNT_FROM_SITE = "REMOVE_ACCOUNT_FROM_SITE",
    UPDATE_SITE_PERMISSIONS = "UPDATE_SITE_PERMISSIONS",
}

enum STATE {
    GET = "GET_STATE",
    SUBSCRIBE = "STATE_SUBSCRIBE",
}

enum ENS {
    LOOKUP_ADDRESS = "LOOKUP_ADDRESS_ENS",
    RESOLVE_NAME = "RESOLVE_ENS_NAME",
}

enum TRANSACTION {
    SEND_ETHER = "SEND_ETHER",
    ADD_NEW_SEND_TRANSACTION = "ADD_NEW_SEND_TRANSACTION",
    UPDATE_SEND_TRANSACTION_GAS = "UPDATE_SEND_TRANSACTION_GAS",
    APPROVE_SEND_TRANSACTION = "APPROVE_SEND_TRANSACTION",
    GET_SEND_TRANSACTION_RESULT = "GET_SEND_TRANSACTION_RESULT",
    CALCULATE_SEND_TRANSACTION_GAS_LIMIT = "CALCULATE_SEND_TRANSACTION_GAS_LIMIT",
    CALCULATE_APPROVE_TRANSACTION_GAS_LIMIT = "CALCULATE_APPROVE_TRANSACTION_GAS_LIMIT",
    GET_LATEST_GAS_PRICE = "GET_LATEST_GAS_PRICE",
    CONFIRM = "CONFIRM_TRANSACTION",
    REJECT = "REJECT_TRANSACTION",
    GET_NEXT_NONCE = "GET_NEXT_NONCE",
}

enum TOKEN {
    GET_BALANCE = "GET_TOKEN_BALANCE",
    GET_TOKENS = "GET_TOKENS",
    GET_USER_TOKENS = "GET_USER_TOKENS",
    GET_TOKEN = "GET_TOKEN",
    ADD_CUSTOM_TOKEN = "ADD_CUSTOM_TOKEN",
    ADD_CUSTOM_TOKENS = "ADD_CUSTOM_TOKENS",
    DELETE_CUSTOM_TOKEN = "DELETE_CUSTOM_TOKEN",
    SEND_TOKEN = "SEND_TOKEN",
    POPULATE_TOKEN_DATA = "POPULATE_TOKEN_DATA",
    SEARCH_TOKEN = "SEARCH_TOKEN",
}

enum WALLET {
    CREATE = "CREATE_WALLET",
    IMPORT = "IMPORT_WALLET",
    RESET = "RESET",
    VERIFY_SEED_PHRASE = "VERIFY_SEED_PHRASE",
    REQUEST_SEED_PHRASE = "REQUEST_SEED_PHRASE",
    SETUP_COMPLETE = "SETUP_COMPLETE",
    DISMISS_WELCOME_MESSAGE = "DISMISS_WELCOME_MESSAGE",
    DISMISS_LATESTS_NEWS_MESSAGE = "DISMISS_LATESTS_NEWS_MESSAGE",
}

enum ADDRESS_BOOK {
    CLEAR = "CLEAR",
    DELETE = "DELETE",
    SET = "SET",
    GET = "GET",
    GET_BY_ADDRESS = "GET_BY_ADDRESS",
    GET_RECENT_ADDRESSES = "GET_RECENT_ADDRESSES",
}

export const Messages = {
    ACCOUNT,
    APP,
    BACKGROUND,
    BLANK,
    DAPP,
    EXTERNAL,
    NETWORK,
    PASSWORD,
    PERMISSION,
    STATE,
    TOKEN,
    ENS,
    TRANSACTION,
    WALLET,
    ADDRESS_BOOK,
}

export enum TransactionStatus {
    FAILED = "FAILED",
    DROPPED = "DROPPED",
    CANCELLED = "CANCELLED",
    SIGNED = "SIGNED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SUBMITTED = "SUBMITTED",
    CONFIRMED = "CONFIRMED",
    UNAPPROVED = "UNAPPROVED",
}

export enum TransactionCategories {
    BLANK_DEPOSIT = "blankDeposit",
    BLANK_WITHDRAWAL = "blankWithdrawal",
    INCOMING = "incoming",
    SENT_ETHER = "sentEther",
    CONTRACT_DEPLOYMENT = "contractDeployment",
    CONTRACT_INTERACTION = "contractInteraction",
    TOKEN_METHOD_APPROVE = "approve",
    TOKEN_METHOD_TRANSFER = "transfer",
    TOKEN_METHOD_TRANSFER_FROM = "transferfrom",
    BLANK_SWAP = "blankSwap",
}

export enum PendingWithdrawalStatus {
    UNSUBMITTED = "UNSUBMITTED",
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED",
    REJECTED = "REJECTED",
    MINED = "MINED",
}

export enum Origin {
    BACKGROUND = "BLANK_BACKGROUND",
    EXTENSION = "BLANK_EXTENSION",
    PROVIDER = "BLANK_PROVIDER",
}

export enum BackgroundActions {
    CLOSE_WINDOW = "CLOSE_WINDOW",
}

/**
 * The meta type of the transaction.
 * - `REGULAR`: A classic transaction
 * - `CANCEL`: A transaction sent to cancel another one
 * - `CANCELLING`: A transaction that we try to cancel
 * - `SPEED_UP`: A transaction sent to speed up another one
 * - `SPEEDING_UP`: A transaction that we try to speed up
 */
export enum MetaType {
    REGULAR = "REGULAR",
    CANCEL = "CANCEL",
    CANCELLING = "CANCELLING",
    SPEED_UP = "SPEED_UP",
    SPEEDING_UP = "SPEEDING_UP",
}
