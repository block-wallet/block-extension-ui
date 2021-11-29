import classnames from "classnames"
import React, { FunctionComponent } from "react"

const ToggleButton: FunctionComponent<{
    label: string
    isChecked: boolean
    onToggle: (checked: boolean) => void
}> = ({ label, isChecked, onToggle }) => {
    return (
        <label
            htmlFor="toggleInput"
            className="flex items-center justify-between w-full cursor-pointer"
        >
            <div className="font-bold text-sm">{label}</div>
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
                    id="toggleInput"
                    className="sr-only"
                    onClick={() => {
                        onToggle(!isChecked)
                    }}
                />
            </div>
        </label>
    )
}

export default ToggleButton
