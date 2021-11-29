import React, { FunctionComponent } from "react"

const VerticalSelect: FunctionComponent<{
    options: any[]
    value: any
    onChange: (value: any) => void
    display: (option: any, i: number) => React.ReactNode
    disableStyles?: boolean
    disabledOptions?: any[]
    containerClassName?: string
    containerStyle?: any
    isActive?: (option: any) => boolean
    isDisabled?: (option: any) => boolean
}> = ({
    options,
    value,
    onChange,
    display,
    disableStyles = false,
    containerClassName,
    containerStyle,
    disabledOptions,
    isActive = (option) =>
        option === value || (option.label && option.label === value),
    isDisabled = (option) =>
        disabledOptions &&
        (disabledOptions[option] || disabledOptions[option.label]),
}) => (
    <div
        className={containerClassName || "flex flex-col space-y-2"}
        style={containerStyle}
    >
        {options.map((option, i) => (
            <button
                type="button"
                disabled={isDisabled(option)}
                key={option.label || option.name || option}
                className={
                    !disableStyles
                        ? `flex flex-row items-center justify-between p-4 rounded-md text-sm transform transition-all duration-300 active:scale-95
                    disabled:pointer-events-none
                    ${
                        isActive(option)
                            ? "bg-primary-300 text-white font-bold"
                            : "bg-primary-100 hover:bg-primary-200"
                    }
                    ${
                        isDisabled(option)
                            ? "pointer-events-none opacity-50"
                            : ""
                    }`
                        : ""
                }
                onClick={() => onChange(option)}
            >
                {display(option, i)}
            </button>
        ))}
    </div>
)

export default VerticalSelect
