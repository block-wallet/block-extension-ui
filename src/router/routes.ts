import { makeRoutes } from "../util/makeRoutes"
import SignPage from "../routes/dApp/SignPage"
import ConnectPage from "../routes/connect/ConnectPage"
import ConnectedSitesPage from "../routes/settings/ConnectedSitesPage"
import ConnectedSiteAccountsPage from "../routes/settings/ConnectedSiteAccountsPage"
import PrivacyPage from "../routes/PrivacyPage"
import TransactionConfirmPage from "../routes/dApp/TransactionConfirmPage"
import AccountsPage from "../routes/account/AccountsPage"
import DepositConfirmPage from "../routes/deposit/DepositConfirmPage"
import DepositDonePage from "../routes/deposit/DepositDonePage"
import DepositPage from "../routes/deposit/DepositPage"
import PopupPage from "../routes/PopupPage"
import ReceivePage from "../routes/ReceivePage"
import SendConfirmPage from "../routes/send/SendConfirmPage"
import SendDonePage from "../routes/send/SendDonePage"
import SendPage from "../routes/send/SendPage"
import CreateAccountPage from "../routes/account/CreateAccountPage"
import AddTokensPage from "../routes/settings/AddTokensPage"
import AddTokensConfirmPage from "../routes/settings/AddTokensConfirmPage"
import ExportAccountPage from "../routes/settings/ExportAccountPage"
import ExportDonePage from "../routes/settings/ExportDonePage"
import SettingsPage from "../routes/settings/SettingsPage"
import WithdrawAmountPage from "../routes/withdraw/WithdrawAmountPage"
import WithdrawDonePage from "../routes/withdraw/WithdrawDonePage"
import WithdrawHistory from "../routes/withdraw/WithdrawHistory"
import WithdrawExternalAccountPage from "../routes/withdraw/WithdrawExternalAccountPage"
import WithdrawTypeSelectPage from "../routes/withdraw/WithdrawTypeSelectPage"
import ReminderPage from "../routes/ReminderPage"
import BackupConfirmPage from "../routes/setup/BackupConfirmPage"
import BackupDonePage from "../routes/BackupDonePage"
import ErrorFallbackPage from "../components/error/ErrorFallbackPage"
import AddressBookPage from "../routes/settings/AddressBookPage"
import AddContactPage from "../routes/settings/AddContactPage"
import SwitchEthereumChain from "../routes/dApp/SwitchEthereumChain"
import LockTimeout from "../routes/settings/LockTimeout"
import WithdrawBlankSelectAccount from "../routes/withdraw/WithdrawBlankSelectAccount"
import WithdrawBlankCreateAccount from "../routes/withdraw/WithdrawBlankCreateAccount"
import WithdrawBlankConfirm from "../routes/withdraw/WithdrawBlankConfirm"
import AccountMenu from "../components/account/AccountMenu"
import EditAccountPage from "../routes/account/EditAccountPage"
import WatchAssetPage from "../routes/dApp/WatchAsset"

export const appRoutes = makeRoutes([
    /* Root */
    { path: "/home", exact: true, component: PopupPage },
    /* My Accounts */
    { path: "/accounts", exact: true, component: AccountsPage },
    {
        path: "/accounts/create",
        exact: true,
        component: CreateAccountPage,
    },
    { path: "/accounts/menu", exact: true, component: AccountMenu },
    { path: "/accounts/menu/edit", exact: true, component: EditAccountPage },
    /* Receive */
    { path: "/accounts/menu/receive", exact: true, component: ReceivePage },

    {
        path: "/accounts/menu/connectedSites",
        exact: true,
        component: ConnectedSitesPage,
    },
    {
        path: "/accounts/menu/connectedSites/accountList",
        exact: true,
        component: ConnectedSiteAccountsPage,
    },
    /* Send */
    { path: "/send", exact: true, component: SendPage },
    { path: "/send/confirm", exact: true, component: SendConfirmPage },
    { path: "/send/done", exact: true, component: SendDonePage },
    /* Deposit */
    { path: "/privacy/deposit", exact: true, component: DepositPage },
    {
        path: "/privacy/deposit/confirm",
        exact: true,
        component: DepositConfirmPage,
    },
    { path: "/privacy/deposit/done", exact: true, component: DepositDonePage },
    /* Withdraw */
    { path: "/privacy/withdraw", exact: true, component: WithdrawAmountPage },
    {
        path: "/privacy/withdraw/select",
        exact: true,
        component: WithdrawTypeSelectPage,
    },
    {
        path: "/privacy/withdraw/blank/accounts",
        exact: true,
        component: WithdrawBlankSelectAccount,
    },
    {
        path: "/privacy/withdraw/blank/accounts/create",
        exact: true,
        component: WithdrawBlankCreateAccount,
    },
    {
        path: "/privacy/withdraw/blank/accounts/step/confirm",
        exact: true,
        component: WithdrawBlankConfirm,
    },

    {
        path: "/privacy/withdraw/external",
        exact: true,
        component: WithdrawExternalAccountPage,
    },
    {
        path: "/privacy/withdraw/done",
        exact: true,
        component: WithdrawDonePage,
    },

    /* Settings */
    { path: "/settings", exact: true, component: SettingsPage },

    { path: "/settings/tokens/add", exact: true, component: AddTokensPage },
    {
        path: "/settings/tokens/add/confirm",
        exact: true,
        component: AddTokensConfirmPage,
    },
    {
        path: "/accounts/menu/export",
        exact: true,
        component: ExportAccountPage,
    },
    {
        path: "/accounts/menu/export/done",
        exact: true,
        component: ExportDonePage,
    },

    {
        path: "/privacy",
        exact: true,
        component: PrivacyPage,
    },
    {
        path: "/privacy/withdrawals",
        exact: true,
        component: WithdrawHistory,
    },
    {
        path: "/settings/lockTimeout",
        exact: true,
        component: LockTimeout,
    },
    /* Address Book */
    {
        path: "/settings/addressBook",
        exact: true,
        component: AddressBookPage,
    },
    {
        path: "/settings/addressBook/add",
        exact: true,
        component: AddContactPage,
    },
    /** Switch Ethereum Chain */
    { path: "/chain/switch", exact: true, component: SwitchEthereumChain },
    /* Sign */
    { path: "/sign", exact: true, component: SignPage },
    /* Watch Asset */
    { path: "/asset", exact: true, component: WatchAssetPage },
    /* Connect */
    { path: "/connect", exact: true, component: ConnectPage },
    {
        path: "/transaction/confirm",
        exact: true,
        component: TransactionConfirmPage,
    },
    /* Reminder to backup seed phrase */
    { path: "/reminder", exact: true, component: ReminderPage },
    { path: "/reminder/backup", exact: true, component: BackupConfirmPage },
    { path: "/reminder/backup/done", exact: true, component: BackupDonePage },
    { path: "/error", exact: true, component: ErrorFallbackPage },
])
