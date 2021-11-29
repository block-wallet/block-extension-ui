import React, { useState } from "react"

// Style
import { Classes, classnames } from "../../styles/classes"
import classNames from "classnames"

// Types
type TextInputProps = {
    appearance: "outline" | "blue-section"
    label?: string
    placeholder?: string
    defaultValue?: string | number
    name?: string
    register?: any
    error?: string
    warning?: string
    disabled?: boolean
    autoFocus?: boolean
    autoComplete?: boolean
    maxLength?: number
    onChange?: (value: any) => void
    readOnly?: boolean
}

/**
 * TextInput:
 * Creates a text input.
 *
 * @param label - Display label above input.
 * @param placeholder - Placeholder for the input.
 * @param defaultValue - Default value for the input.
 * @param name - Name of the input, for yup validation.
 * @param register - Yup reference.
 * @param error - Yup error or message to display as red error under input.
 * @param warning - Warning orange message to display under input.
 * @param disabled - Disabling input if true.
 * @param autoFocus - Auto focus input when entering page if true.
 * @param autoComplete - Enable browser autocomplete suggestions if true.
 * @param maxLength - Limit size of the input value.
 * @param onChange - Function to execute on input change.
 * @param readOnly - readOnly attribute
 */
const TextInput = (props: TextInputProps) => {
    const {
        appearance,
        label,
        placeholder,
        defaultValue,
        name,
        register,
        error = "",
        warning = "",
        autoFocus,
        autoComplete,
        maxLength,
        disabled,
        onChange,
        readOnly = false
    } = props

    const [hasFocus, setHasFocus] = useState(autoFocus)

    return (
        <div
            className={classnames(
                appearance === "blue-section" && Classes.blueSection,
                appearance === "blue-section" &&
                    hasFocus &&
                    Classes.blueSectionActive
            )}
        >
            {/* LABEL */}
            {label ? (
                <label htmlFor="accountName" className={Classes.inputLabel}>
                    {label}
                </label>
            ) : null}

            {/* INPUT */}
            <input
                name={name}
                type="text"
                defaultValue={defaultValue ? defaultValue : undefined}
                ref={register ? register : null}
                className={classNames(
                    appearance === "outline"
                        ? Classes.input
                        : Classes.blueSectionInput,
                    error !== "" ? "border-red-400 focus:border-red-400" : "",
                    warning !== ""
                        ? "border-yellow-400 focus:border-yellow-400"
                        : ""
                )}
                placeholder={placeholder ? placeholder : ""}
                autoFocus={autoFocus ? autoFocus : false}
                autoComplete={autoComplete ? "on" : "off"}
                maxLength={maxLength ? maxLength : -1}
                disabled={disabled ? disabled : false}
                onChange={onChange}
                readOnly={readOnly}
                onFocus={() => setHasFocus(true)}
                onBlur={() => setHasFocus(false)}
            />

            {/* ERROR */}
            <span
                className={classNames(
                    "text-xs overflow-ellipsis overflow-hidden",
                    error !== "" ? "text-red-500" : "",
                    warning !== "" ? "text-yellow-500" : "",
                    error === "" && warning === "" ? "m-0 h-0" : ""
                )}
            >
                {error || warning || ""}
            </span>
        </div>
    )
}

export default TextInput
