import React, {
    FC,
    FunctionComponent,
    useRef,
    useEffect,
    useState,
    ReactNode,
    ReactElement,
} from "react"
import { useOnClickOutside } from "../../util/useOnClickOutside"
import classnames from "classnames"
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri"
import { BsCheck } from "react-icons/bs"
import { Classes } from "../../styles"

interface CompoundMember {
    compoundName?: string
}

interface CompoundProps {
    DropdownItem: FunctionComponent<ItemProps> & CompoundMember
}

type ValueType = string | number | undefined

interface ItemProps {
    onClick?: (value: ValueType) => void
    value?: ValueType
    selected?: boolean
    children: ReactNode
}

interface DropdownProps {
    label?: string
    onChange: (selected: any) => void
    currentValue: ValueType
    placeholder?: string
    error?: string
    id?: string
}

const Dropdown: FC<DropdownProps> & CompoundProps = ({
    label,
    onChange,
    currentValue,
    children,
    placeholder,
    id,
    error,
}) => {
    const [showMenu, setShowMenu] = useState(false)
    const [dropdownLabel, setDropdownLabel] = useState(null)
    const ref = useRef(null)
    useOnClickOutside(ref, () => setShowMenu(false))
    const handleItemChange = (value: number | string) => {
        setShowMenu(false)
        onChange(value)
    }

    useEffect(() => {
        if (currentValue !== null && currentValue !== undefined) {
            React.Children.forEach(
                children as ReactElement[],
                (child: ReactElement) => {
                    if (currentValue === child?.props.value) {
                        setDropdownLabel(
                            child.props.label || child.props.children
                        )
                    }
                }
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentValue, children])

    return (
        <div className="space-y-1">
            {label ? (
                <label
                    htmlFor={id || "dropdownSelect"}
                    className={classnames(Classes.inputLabel, "mb-1")}
                >
                    {label}
                </label>
            ) : null}
            <div
                className="relative"
                role="combobox"
                aria-controls="menu"
                aria-expanded={showMenu}
                id={id || "dropdownSelect"}
                ref={ref}
            >
                <div
                    onClick={() => {
                        setShowMenu(!showMenu)
                    }}
                    className={classnames(
                        "relative flex flex-row justify-between items-center text-gray-600 border rounded-md group border-primary-200 hover:border-primary-300 cursor-pointer select-none px-3 py-2",
                        showMenu && "border-primary-300"
                    )}
                >
                    <span>{dropdownLabel || placeholder}</span>
                    {showMenu ? (
                        <RiArrowUpSLine size={20} />
                    ) : (
                        <RiArrowDownSLine size={20} />
                    )}
                </div>
                <div
                    hidden={!showMenu}
                    className="fixed shadow-md rounded-md mt-1 bg-white select-none w-full h-auto max-h-52 overflow-y-scroll dropdown-list z-[20000]"
                    style={{ maxWidth: "305px" }}
                    id="menu"
                    role="menu"
                >
                    <ul>
                        {React.Children.map(
                            children as ReactElement[],
                            (child: ReactElement) => {
                                const { props, type } = child
                                if (
                                    (type as typeof DropdownItem)
                                        .compoundName !== "DropdownItem"
                                ) {
                                    throw new Error(
                                        "Only Dropdown.Item children are allowed"
                                    )
                                }
                                return React.cloneElement(child, {
                                    ...props,
                                    onClick: handleItemChange,
                                    selected:
                                        currentValue === child.props.value,
                                })
                            }
                        )}
                    </ul>
                </div>
            </div>
            {/* ERROR */}
            <span
                role="alert"
                className={classnames(
                    "text-xs text-red-500",
                    error === "" ? "m-0 h-0" : ""
                )}
            >
                {error || ""}
            </span>
        </div>
    )
}

const DropdownItem: FC<ItemProps> & CompoundMember = ({
    onClick,
    value,
    selected,
    children,
}) => {
    return (
        <li
            className={
                "cursor-pointer flex flex-row justify-between px-3 py-2 items-center hover:bg-gray-100"
            }
            onClick={() => onClick && onClick(value)}
        >
            <span
                className={classnames("leading-loose", selected && "font-bold")}
            >
                {children}
            </span>
            {selected && <BsCheck size={20} />}
        </li>
    )
}

DropdownItem.compoundName = "DropdownItem"

Dropdown.DropdownItem = React.memo(DropdownItem)

Dropdown.DropdownItem.compoundName = "DropdownItem"

export default Dropdown
