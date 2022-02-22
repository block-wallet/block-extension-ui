import React, { useReducer } from "react"

// Components
import LoadingDialog from "./LoadingDialog"
import ErrorDialog from "./ErrorDialog"
import SuccessDialog from "./SuccessDialog"

type texts = { loading: string; success: string; error: string }

export type status = "loading" | "success" | "error"
export type loadingDialogProps = {
    open: boolean
    status: status
    titles: texts
    texts: texts
    onDone: () => void
    timeout?: number // Success only: If setted, it will trigger onDone() after timeout value.
    txHash?: string // Success only: If valid hash, shows explorer link i.e. View on Etherscan
}

type state = { isOpen: boolean; status: status }

type action =
    | {
          type: "open" | "setStatus"
          payload: { status: status }
      }
    | {
          type: "close"
      }

const reducer = (state: state, action: action) => {
    switch (action.type) {
        case "open":
            return { status: action.payload.status, isOpen: true }
        case "close":
            return { ...state, isOpen: false }
        case "setStatus":
            return { ...state, status: action.payload.status }
    }
}

export const useWaitingDialog = (
    {
        defaultStatus = "loading",
        defaultIsOpen = false,
    }: {
        defaultStatus?: status
        defaultIsOpen?: boolean
    } = {
        defaultStatus: "loading",
        defaultIsOpen: false,
    }
) => {
    const [state, dispatch] = useReducer(reducer, {
        isOpen: defaultIsOpen,
        status: defaultStatus,
    })

    return {
        ...state,
        dispatch,
    }
}

/**
 * ### Why?
 * WaitingDialog is way to easily implements this kind of flow:
 * ```
 * Loading -> Success | Error
 * ```
 * The component is based on a status that can take one of these value: `loading | success | error`
 * Depending on the status it'll show a different modal.
 *
 * ### How to use it?
 * To avoid repeating this kind of code:
 * ```
 * const [isOpen, setIsOpen] = useState(false)
 * const [status, setStatus] = useState('loading')
 * ```
 * You can use the hook that comes with the component:
 * ```
 * const { isOpen, status, dispatch } = useWaitingDialog()
 * ```
 *
 * If you want to update `isOpen` or `status`, you can do like so:
 * ```
 * // Set isOpen = false
 * dispatch({ type: "close" })
 *
 * // Set isOpen = true & status = 'loading | success | error'
 * dispatch({ type: "open", payload: { status: 'loading | success | error' }})
 *
 * // Set status = 'loading | success | error'
 * dispatch({ type: "status", payload: { status: 'loading | success | error' }})
 * ```
 */
const WaitingDialog = ({
    open,
    status,
    titles,
    texts,
    txHash,
    timeout,
    onDone,
}: loadingDialogProps) => {
    if (!open) return <></>

    switch (status) {
        case "loading":
            return (
                <LoadingDialog
                    open={status === "loading"}
                    title={titles.loading}
                    message={texts.loading}
                />
            )
        case "success":
            return (
                <SuccessDialog
                    open={status === "success"}
                    title={titles.success}
                    message={texts.success}
                    timeout={timeout}
                    txHash={txHash}
                    onDone={onDone}
                />
            )
        case "error":
            return (
                <ErrorDialog
                    open={status === "error"}
                    title={titles.error}
                    message={texts.error}
                    onClickButton={onDone}
                    onClickOutside={onDone}
                />
            )
    }
}

export default WaitingDialog
