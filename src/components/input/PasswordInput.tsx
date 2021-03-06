import React, { useState } from "react"
import PasswordStrengthBar from "react-password-strength-bar"

import { BsCapslockFill } from "react-icons/bs"
import CapsLockDetector from "./CapsLockDetector"

// Style
import { Classes } from "../../styles/classes"
import classNames from "classnames"

// Assets
import eyeOpen from "../../assets/images/icons/eye_open.svg"
import eyeClose from "../../assets/images/icons/eye_close.svg"

// Types
type PasswordInputProps = {
    label?: string
    placeholder?: string
    name?: string
    register?: any
    error?: string
    autoFocus?: boolean
    autoComplete?: string
    strengthBar?: boolean
    onChange?: (value: any) => void
    setPasswordScore?: (value: number) => void
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}

/**
 * TextInput:
 * Creates a password input with a visible / hidden status.
 *
 * @param label - Display label above input.
 * @param placeholder - Placeholder for the input.
 * @param name - Name of the input, for yup validation.
 * @param register - Yup reference.
 * @param error - Yup error or message to display as red error under input.
 * @param autoFocus - Auto focus input when entering page if true.
 * @param autoComplete - Enable browser autocomplete suggestions if true.
 * @param strengthBar - Show the strength of the input password.
 * @param onChange - Function to execute on input change.
 * @param setPasswordScore - Function to execute on password score change (if it has strengthBar).
 * @param onKeyDown - Function to execute on key down.
 */
const PasswordInput = (props: PasswordInputProps) => {
    const {
        label,
        placeholder,
        name,
        register,
        error = "",
        autoFocus,
        autoComplete,
        strengthBar,
        onChange,
        setPasswordScore,
        onKeyDown,
    } = props

    // State
    const [passwordValue, setPasswordValue] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showStrengthBar, setShowStrengthBar] = useState<boolean>(false)

    // Handlers
    const handlePasswordChange = (e: any) => {
        setPasswordValue(e.target.value)
        setShowStrengthBar(e.target.value.length > 0)
        if (onChange) onChange(e)
    }

    return (
        <CapsLockDetector>
            {({ isCapsLock }) => (
                <>
                    {/* LABEL */}
                    {label ? (
                        <label
                            htmlFor="accountName"
                            className={Classes.inputLabel}
                        >
                            {label}
                        </label>
                    ) : null}

                    {/* INPUT */}
                    <div className="flex items-center flex-row relative">
                        <input
                            name={name ? name : "password"}
                            type={showPassword ? "text" : "password"}
                            ref={register ? register : null}
                            className={classNames(
                                Classes.input,
                                "w-full",
                                error !== ""
                                    ? "border-red-400 focus:border-red-400"
                                    : ""
                            )}
                            placeholder={placeholder ? placeholder : ""}
                            autoComplete={autoComplete ? autoComplete : "off"}
                            autoFocus={autoFocus ? autoFocus : false}
                            onChange={(e) => handlePasswordChange(e)}
                            onKeyDown={onKeyDown}
                        />
                        <img
                            className={classNames(
                                "w-6 h-6 p-1 absolute right-0 transition-all duration-300 cursor-pointer hover:bg-primary-100 rounded-full",
                                showPassword === false
                                    ? "opacity-100 z-10"
                                    : "opacity-0 pointer-event-none z-0"
                            )}
                            src={eyeClose}
                            alt="show password"
                            onClick={() => setShowPassword(true)}
                        />
                        <img
                            className={classNames(
                                "w-6 h-6 p-1 absolute right-0 transition-all duration-300 cursor-pointer hover:bg-primary-100 rounded-full",
                                showPassword === true
                                    ? "opacity-100 z-10"
                                    : "opacity-0 pointer-event-none z-0"
                            )}
                            src={eyeOpen}
                            alt="hide password"
                            onClick={() => setShowPassword(false)}
                        />
                        {isCapsLock && (
                            <BsCapslockFill
                                className="w-4 h-4 absolute right-6"
                                color="#8093AB"
                            />
                        )}
                    </div>

                    {/* STRENGTH */}
                    {strengthBar ? (
                        <PasswordStrengthBar
                            password={passwordValue}
                            className={classNames(
                                "m-0",
                                showStrengthBar ? "" : "hidden"
                            )}
                            onChangeScore={(s) => {
                                if (setPasswordScore) {
                                    setPasswordScore(s)
                                }
                            }}
                        />
                    ) : null}

                    {/* ERROR */}
                    <span
                        className={classNames(
                            "text-xs text-red-500",
                            error === "" ? "m-0 h-0" : ""
                        )}
                    >
                        {error || ""}
                    </span>
                </>
            )}
        </CapsLockDetector>
    )
}

export default PasswordInput
