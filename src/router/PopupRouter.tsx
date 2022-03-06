import React, { FunctionComponent, useEffect, useMemo, useState } from "react"
import { HashRouter, Redirect, Route } from "react-router-dom"
import { useBlankState } from "../context/background/backgroundHooks"
import PendingSetupPage from "../routes/setup/PendingSetupPage"
import UnlockPage from "../routes/UnlockPage"
import { appRoutes } from "./routes"
import "./routeTransitions.css"
import { lockApp } from "../context/commActions"
import { LastLocationProvider } from "react-router-last-location"
import { TransitionRoute } from "./TransitionRoute"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallbackPage from "../components/error/ErrorFallbackPage"
import MessageDialog from "../components/dialog/MessageDialog"
import ErrorDialog from "../components/dialog/ErrorDialog"
import getRequestRouteAndStatus from "../context/util/getRequestRouteAndStatus"
import { CgDanger } from "react-icons/cg"
import { Classes } from "../styles"
import classnames from "classnames"
import NetworkSelect from "../components/input/NetworkSelect"
import Divider from "../components/Divider"
import IdleComponent from "../components/IdleComponent"
import WalletNews from "../components/news/WalletNews"
/**  Purpose of this component is to check in Blank State if there is any pending connect to site or transaction confirm
 *  in order to show that page always, whenever the extension is loaded and unlocked.
 */
const PopupComponent = () => {
    const {
        isOnboarded,
        isAppUnlocked,
        permissionRequests,
        unapprovedTransactions,
        dappRequests,
    } = useBlankState()!

    const showUnlock = useMemo(() => {
        return isOnboarded && !isAppUnlocked
    }, [isOnboarded, isAppUnlocked])

    // Get if we should display the popup and the correct route
    // depending on the order of the requests.
    const [showPage, route] = getRequestRouteAndStatus(
        permissionRequests,
        unapprovedTransactions,
        dappRequests
    )

    if (showUnlock) {
        return (
            <>
                <Redirect to="/unlock" />
                <TransitionRoute
                    component={UnlockPage}
                    path="/unlock"
                ></TransitionRoute>
            </>
        )
    }

    return (
        <WalletNews>
            <Route exact path="/">
                {showPage ? <Redirect to={route} /> : <Redirect to="/home" />}
            </Route>
            {appRoutes}
        </WalletNews>
    )
}

const PopupRouter: FunctionComponent = ({ children }) => {
    // Ensure body has popup class to mantain fixed width/height when opening from extension or window
    document.body.classList.add("popup")

    const state = useBlankState()!
    const isOnboarded = state?.isOnboarded
    const resetHandler = async () => {
        await lockApp()
    }

    const [shouldShowDialog, setShouldShowDialog] = useState(false)

    useEffect(() => {
        setShouldShowDialog(!state.isUserNetworkOnline)
    }, [state.isUserNetworkOnline])

    return (
        <HashRouter>
            <LastLocationProvider>
                <ErrorBoundary
                    FallbackComponent={ErrorFallbackPage}
                    onReset={resetHandler}
                    resetKeys={[state.isAppUnlocked]}
                >
                    {isOnboarded ? (
                        <>
                            <MessageDialog
                                header={
                                    <>
                                        <NetworkSelect
                                            className="mb-4 m-auto"
                                            optionsContainerClassName="overflow-auto max-h-72"
                                        />
                                        <CgDanger className="text-red-500 w-20 h-20 mb-2 block m-auto" />
                                    </>
                                }
                                title="Provider down"
                                message="The current network is down. Please select another network."
                                open={
                                    !state.isProviderNetworkOnline &&
                                    state.isUserNetworkOnline
                                }
                            />
                            <ErrorDialog
                                onClickOutside={() =>
                                    setShouldShowDialog(false)
                                }
                                title="No connection"
                                message="Please check your internet connection. Some features of the wallet will remain disabled while you’re offline."
                                open={shouldShowDialog}
                                onClickButton={() => setShouldShowDialog(false)}
                            />
                            <IdleComponent>
                                <PopupComponent />
                            </IdleComponent>
                        </>
                    ) : (
                        <PendingSetupPage />
                    )}
                    {children}
                </ErrorBoundary>
            </LastLocationProvider>
        </HashRouter>
    )
}

export default PopupRouter
