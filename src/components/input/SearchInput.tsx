import React, { forwardRef, useEffect, useState, useRef } from 'react'

// Style
import classnames from 'classnames'
import { Classes } from '../../styles/classes'

// Hooks
import { useOnClickOutside } from '../../util/useOnClickOutside';
import { useMergeRefs } from '../../context/hooks/useMergeRefs';

// Assets
import searchIcon from '../../assets/images/icons/search.svg'
import CheckmarkCircle from '../icons/CheckmarkCircle'

// Types
type SearchInputProps = {
    label?: string
    placeholder?: string
    name?: string
    register?: any
    error?: string
    warning?: string
    disabled?: boolean
    autoFocus?: boolean
    autoComplete?: boolean
    isValid?: boolean
    onChange?: (event: any) => void
}

/**
 * SearchInput:
 * Creates a search text input.
 * On focus will hide search icon, and when isValid props is set to true, display a green outline & checkmark.
 *
 * @param label - Display label above input.
 * @param placeholder - Placeholder for the input.
 * @param name - Name of the input, for yup validation.
 * @param register - Yup reference.
 * @param error - Yup error or message to display as red error under input.
 * @param warning - Warning orange message to display under input.
 * @param disabled - Disabling input if true.
 * @param autoFocus - Auto focus input when entering page if true.
 * @param autoComplete - Enable browser autocomplete suggestions if true.
 * @param isValid - Display a green outline & checkmark if true.
 * @param onChange - Function to execute on input change.
 */
const SearchInput = forwardRef<SearchInputProps, any>(
    ({ label, placeholder, name, error = '', warning = '', disabled, autoFocus, autoComplete, isValid, onChange }, register) => {
        const inputRef = useRef(null)

        // State
        const [forwardedRef, setForwardedRef] = useState<any>(null)
        const [isFocus, setIsFocus] = useState<boolean>(false)
        const [search, setSearch] = useState<string>('')

        // Hooks
        useEffect(() => {
            setForwardedRef(register)
        }, [register])

        useOnClickOutside(inputRef, () => {
            if (search === '') setIsFocus(false)
        })

        return (
            <>
                {/* LABEL */}
                {
                    label ? (
                        <label htmlFor="accountName" className={Classes.inputLabel}>
                            {label}
                        </label>
                    ) : null
                }

                {/* SEARCH */}
                <div className={classnames(
                    "flex justify-start items-center relative",
                    label ? "mt-2" : "",
                    error !== "" || warning !== "" ? "mb-2" : ""
                )}>
                    <img
                        src={searchIcon}
                        alt="search"
                        className={classnames(
                            'h-4 ml-3 absolute z-10 transition-all delay-100',
                            isFocus ? 'opacity-0 w-0' : 'opacity-100 w-4'
                        )}
                    />

                    <input
                        name={name ? name : 'Search'}
                        type="text"
                        ref={useMergeRefs(inputRef, forwardedRef ? forwardedRef : null)}
                        className={classnames(
                            Classes.inputBordered,
                            'w-full relative z-0 outline-none	transition-all delay-100',
                            isFocus ? 'pl-2' : 'pl-9',
                            isValid ? 'border-green-400 focus:border-green-400' : ''
                        )}
                        placeholder={placeholder ? placeholder : ''}
                        autoFocus={autoFocus ? autoFocus : false}
                        disabled={disabled ? disabled : false}
                        autoComplete={autoComplete ? "on" : "off"}
                        onChange={e => {
                            setSearch(e.target.value)
                            if (onChange) onChange(e)
                        }}
                        onFocus={() => setIsFocus(true)}
                    />

                    <CheckmarkCircle
                        classes={`
              h-4 transition-all delay-100
              ${isValid ? 'opacity-100 w-4 ml-3' : 'opacity-0 w-0 ml-0'}
            `}
                        animate={isValid}
                    />
                </div>

                {/* ERROR */}
                <span
                    className={classnames(
                        "text-xs",
                        error !== "" ? "text-red-500" : "",
                        warning !== "" ? "text-yellow-500" : "",
                        error === "" && warning === "" ? "m-0 h-0" : "",
                    )}
                >
                    {error || warning || ''}
                </span>
            </>
        )
    }
)

export default SearchInput
