import React, { FunctionComponent, useEffect, useMemo, useState } from "react"
import { HashRouter, Redirect, Route } from "react-router-dom"
import { useBlankState } from "../context/background/backgroundHooks"
import PendingSetupPage from "../routes/setup/PendingSetupPage"
import UnlockPage from "../routes/UnlockPage"
import { appRoutes } from "./routes"
import IdleTimer from "react-idle-timer"
import "./routeTransitions.css"
import { lockApp, setLastUserActiveTime } from "../context/commActions"
import { LastLocationProvider } from "react-router-last-location"
import { TransitionRoute } from "./TransitionRoute"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallbackPage from "../components/error/ErrorFallbackPage"
import MessageDialog from "../components/dialog/MessageDialog"
import getRequestRouteAndStatus from "../context/util/getRequestRouteAndStatus"
import { CgDanger } from "react-icons/cg"
import { Classes } from "../styles"
import classnames from "classnames"
import NetworkSelect from "../components/input/NetworkSelect"
import Divider from "../components/Divider"
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
        <>
            <Route exact path="/">
                {showPage ? <Redirect to={route} /> : <Redirect to="/home" />}
            </Route>
            {appRoutes}
        </>
    )
}

const IdleComponent: FunctionComponent = ({ children }) => {
    let idleTimer: IdleTimer = {} as IdleTimer

    const handleOnAction = async () => {
        setLastUserActiveTime()
    }

    return (
        <IdleTimer
            ref={(ref: IdleTimer) => {
                idleTimer = ref
            }}
            onAction={handleOnAction}
            debounce={1000}
            eventsThrottle={420}
        >
            {children}
        </IdleTimer>
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
                            <MessageDialog
                                header={
                                    <CgDanger className="text-red-500 w-20 h-20 mb-2 block m-auto" />
                                }
                                footer={
                                    <>
                                        <div className="-mx-6">
                                            <Divider />
                                        </div>
                                        <button
                                            className={classnames(
                                                Classes.liteButton,
                                                "mt-4"
                                            )}
                                            onClick={() =>
                                                setShouldShowDialog(false)
                                            }
                                        >
                                            OK
                                        </button>
                                    </>
                                }
                                onClickOutside={() =>
                                    setShouldShowDialog(false)
                                }
                                title="No connection"
                                message="Please check your internet connection. Some features of the wallet will remain disabled while you’re offline."
                                open={shouldShowDialog}
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
