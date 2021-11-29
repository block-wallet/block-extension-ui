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
        <div
            className={classnames(
                "bg-gray-100 bg-opacity-50 fixed inset-0 w-full h-screen z-50 overflow-hidden flex flex-col items-center justify-center",
                !open && "hidden"
            )}
            style={{ maxWidth: "390px", maxHeight: "600px" }}
        >
            <CSSTransition
                in={open}
                timeout={400}
                unmountOnExit
                classNames={"slide"}
            >
                <div
                    ref={ref}
                    className="relative p-6 opacity-100 w-10/12 bg-white shadow-md rounded-md flex-col flex"
                >
                    {children}
                </div>
            </CSSTransition>
        </div>
    )
}

export default Dialog
