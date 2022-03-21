import React, { useRef, useState, FC } from "react"
import classnames from "classnames"

import { useOnClickOutside } from "../../util/useOnClickOutside"
import ThreeDotsIcon from "../icons/ThreeDotsIcon"
import blueDotsIcon from "../../assets/images/icons/blue_dots.svg"

const DotsMenu: FC = ({ children }) => {
    const [showOptions, setShowOptions] = useState(false)

    const ref = useRef(null)
    useOnClickOutside(ref, () => setShowOptions(false))
    return (
        <div className="relative" ref={ref}>
            <div
                className={classnames(
                    "p-2 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300 cursor-pointer select-none",
                    showOptions ? "bg-primary-100 text-primary-300" : ""
                )}
                onClick={() => {
                    setShowOptions(!showOptions)
                }}
            >
                {showOptions ? (
                    <img src={blueDotsIcon} alt="options" className="w-4 h-4" />
                ) : (
                    <div className="w-4 h-4 flex items-center justify-center">
                        <ThreeDotsIcon />
                    </div>
                )}
            </div>

            <div
                className={classnames(
                    "absolute shadow-md bg-white right-0 select-none rounded-md z-10 font-semibold",
                    showOptions ? "" : "hidden"
                )}
                id="dotsMenu"
                role="menu"
                onClick={() => {
                    setShowOptions(false)
                }}
            >
                {children}
            </div>
        </div>
    )
}

export default DotsMenu
