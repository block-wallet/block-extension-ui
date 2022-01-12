import classnames from "classnames"
import React, { FunctionComponent, useEffect, useState } from "react"

const ToggleButton: FunctionComponent<{
    register?: any

    label?: string
    inputName?: string
    defaultChecked: boolean
    onToggle: (checked: boolean) => void
}> = ({ register, label, inputName, defaultChecked, onToggle }) => {
    const [isChecked, setIsCheked] = useState(defaultChecked)

    useEffect(() => {
        onToggle(isChecked)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChecked])

    useEffect(() => {
        setIsCheked(defaultChecked)
    }, [defaultChecked])

    return (
        <label
            htmlFor="toggleInput"
            className="flex items-center justify-between w-full cursor-pointer"
        >
            {label && <div className="font-bold text-sm">{label}</div>}
            <div className="group relative">
                <div
                    className={classnames(
                        "block w-11 h-6 rounded-full",
                        isChecked ? "bg-primary-300" : "bg-primary-200"
                    )}
                ></div>
                <div
                    className={classnames(
                        "dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition transform",
                        isChecked && "translate-x-full"
                    )}
                ></div>
                <input
                    type="checkbox"
                    ref={register}
                    id="toggleInput"
                    name={inputName ?? "toggleInput"}
                    className="sr-only"
                    onClick={() => {
                        setIsCheked(!isChecked)
                    }}
                />
            </div>
        </label>
    )
}

export default ToggleButton
