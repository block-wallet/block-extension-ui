import React from 'react'

// Style
import classnames from 'classnames'
import { Classes } from '../../styles/classes'

// Types
type SelectInputProps = {
    label?: string
    name?: string
    register?: any
    error?: string
    autoFocus?: boolean
    children: any
    onChange?: (value: any) => void
}

/**
 * SelectInput:
 * Creates a select input, passing options via childrens of this component.
 *
 * @param label - Display label above input.
 * @param name - Name of the input, for yup validation.
 * @param register - Yup reference.
 * @param error - Yup error or message to display as red error under input.
 * @param autoFocus - Auto focus input when entering page if true.
 * @param children - Must be the <options> to select.
 */
const SelectInput = (props: SelectInputProps) => {
    const { label, name, register, error = '', autoFocus, children, onChange } = props

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

            {/* SELECT */}
            <select
                name={name ? name : ''}
                ref={register ? register : null}
                className={classnames(Classes.input, 'py-2.5')}
                autoFocus={autoFocus ? autoFocus : false}
                onChange={(event: any) => {
                    onChange && onChange(event.target.value)
                }}
            >
                {children}
            </select>

            {/* ERROR */}
            <span
                className={classnames(
                    "text-xs text-red-500",
                    error === '' ? 'm-0 h-0' : ''
                )}
            >
                {error || ''}
            </span>
        </>
    )
}

export default SelectInput