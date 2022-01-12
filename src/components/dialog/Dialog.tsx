import React, { FunctionComponent, useRef } from "react"
import { useOnClickOutside } from "../../util/useOnClickOutside"
import { CSSTransition } from "react-transition-group"
import "../../router/routeTransitions.css"
import { classnames } from "../../styles"

const Dialog: FunctionComponent<{
    children: React.ReactNode
    open: boolean
    onClickOutside?: () => void
}> = ({ onClickOutside, open, children }) => {
    const ref = useRef(null)
    useOnClickOutside(ref, () => onClickOutside?.())

    //return open ? (

    //) : null
    return (
        <CSSTransition
            in={open}
            timeout={200}
            unmountOnExit
            classNames={"appear"}
        >
            <div
                className={classnames(
                    "bg-gray-100 bg-opacity-50 fixed inset-0 w-full h-screen z-50 overflow-hidden flex flex-col items-center justify-center px-6"
                )}
                style={{
                    maxWidth: "390px",
                    maxHeight: "600px",
                    marginTop: "0px",
                }}
            >
                <div
                    ref={ref}
                    className="relative py-6 px-3 opacity-100 w-full bg-white shadow-md rounded-md flex-col flex"
                >
                    {children}
                </div>
            </div>
        </CSSTransition>
    )
}

export default Dialog
