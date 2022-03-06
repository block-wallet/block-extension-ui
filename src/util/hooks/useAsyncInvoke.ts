import * as React from "react"

enum Status {
    IDLE = "idle",
    PENDING = "pending",
    SUCCESS = "success",
    ERROR = "error",
}

interface AsyncState<T> {
    status?: Status
    data?: T
    error?: Error
}

const defaultInitialState = { status: Status.IDLE, data: null, error: null }

//

/**
 * This hook aims to encapsulate async information such us the status,
 * response data and invocation error.
 *
 * @param initialState
 *
 * Example usage:
 * ```
 * const {data, error, status, run} = useAsyncInvoke()
 * const executeSave = (newData) => {
 *  run(saveData(newData))
 * }
 * ```
 */
function useAsyncInvoke<T>(initialState: AsyncState<T> = {}) {
    const initialStateRef = React.useRef({
        ...defaultInitialState,
        ...initialState,
    })
    const [{ status, data, error }, setState] = React.useReducer(
        (s: AsyncState<T>, a: any) => ({ ...s, ...a }),
        initialStateRef.current
    )

    const setData = React.useCallback(
        (data) => setState({ data, status: Status.SUCCESS }),
        [setState]
    )
    const setError = React.useCallback(
        (error) => setState({ error, status: Status.ERROR }),
        [setState]
    )
    const reset = React.useCallback(() => setState(initialStateRef.current), [
        setState,
    ])

    const run = React.useCallback(
        (promise) => {
            if (!promise || !promise.then) {
                throw new Error(
                    `The argument passed to useAsyncInvoke().run must be a promise.`
                )
            }
            setState({ status: Status.PENDING })
            return promise.then(
                (data: any) => {
                    setData(data)
                    return data
                },
                (error: Error) => {
                    setError(error)
                    return Promise.reject(error)
                }
            )
        },
        [setState, setData, setError]
    )

    return {
        isIdle: status === Status.IDLE,
        isLoading: status === Status.PENDING,
        isError: status === Status.ERROR,
        isSuccess: status === Status.SUCCESS,

        setData,
        setError,
        error,
        status,
        data,
        run,
        reset,
    }
}

export default useAsyncInvoke
