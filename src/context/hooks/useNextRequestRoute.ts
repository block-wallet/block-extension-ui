import { useBlankState } from "../background/backgroundHooks"
import getRequestRouteAndStatus from "../util/getRequestRouteAndStatus"

/**
 * It returns the next pending request route
 *
 * @returns The route to the next pending request view
 */
const useNextRequestRoute = () => {
    const {
        permissionRequests,
        unapprovedTransactions,
        dappRequests,
    } = useBlankState()!

    const [isNotEmpty, route] = getRequestRouteAndStatus(
        permissionRequests,
        unapprovedTransactions,
        dappRequests
    )

    return isNotEmpty ? route : "/home"
}

export default useNextRequestRoute
