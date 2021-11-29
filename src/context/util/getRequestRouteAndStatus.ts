import { PermissionRequest } from "@blank/background/controllers/PermissionsController"
import { TransactionMeta } from "@blank/background/controllers/transactions/utils/types"
import {
    DappRequest,
    DappRequestParams,
} from "@blank/background/utils/types/ethereum"
import { DappReq } from "../hooks/useDappRequest"

const getRequestRouteAndStatus = (
    permissionRequests: {
        [id: string]: PermissionRequest
    },
    unapprovedTransactions: {
        [id: string]: TransactionMeta
    },
    dappRequests: {
        [id: string]: DappRequest<keyof DappRequestParams>
    }
): [boolean, string] => {
    // Filter permission requests
    const permissionsReqs = Object.entries(
        permissionRequests
    ).map(([, { time }]) => ({ time, route: "/connect" }))

    // Filter tx requests
    const transactionReqs = Object.entries(
        unapprovedTransactions
    ).map(([, { time }]) => ({ time, route: "/transaction/confirm" }))

    // Filter DApp requests
    const dappReqs = Object.entries(dappRequests).map(([, { time, type }]) => ({
        time,
        route:
            type === DappReq.SIGNING
                ? "/sign"
                : type === DappReq.ASSET
                ? "/asset"
                : type === DappReq.SWITCH_NETWORK
                ? "/chain/switch"
                : "",
    }))

    // Get the older one, and if the list is empty
    const sortedList = [
        ...permissionsReqs,
        ...transactionReqs,
        ...dappReqs,
    ].sort(({ time: timeA }, { time: timeB }) => timeA - timeB)

    const isEmpty = sortedList.length === 0

    return [!isEmpty, !isEmpty ? sortedList[0].route : ""]
}

export default getRequestRouteAndStatus
