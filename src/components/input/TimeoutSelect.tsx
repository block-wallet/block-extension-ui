import classnames from "classnames"
import React, { FunctionComponent, useRef, useState } from "react"
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri"
import { BsCheck } from "react-icons/bs"
import { useOnClickOutside } from "../../util/useOnClickOutside"

interface DropdownItem {
    caption: string
    value: string | number
}

export type DropdownList = DropdownItem[]

const TimeoutSelect: FunctionComponent<{
    list: DropdownList
    currentValue: string | number
    selectedValue: string | number
    setSelectedValue: (item: string | number) => void
}> = ({ list, currentValue, selectedValue, setSelectedValue }) => {
    const [isListEnabled, setIsListEnabled] = useState(false)

    const ref = useRef(null)
    useOnClickOutside(ref, () => setIsListEnabled(false))

    const handleItemChange = (value: number | string) => {
        setIsListEnabled(false)
        setSelectedValue(value)
    }

    /**
     * Returns the drop
     *
     * @param itemValue list item value
     */
    const getDropdownItem = (
        itemValue: DropdownItem["value"]
    ): DropdownItem => {
        let item: DropdownItem | null = null

        list.forEach((listItem, index) => {
            if (listItem.value === itemValue) {
                item = list[index]
            }
        })

        if (!item) {
            throw new Error("List item not found")
        }

        return item
    }

    const ListItem: FunctionComponent<{
        item: DropdownItem
    }> = ({ item }) => (
        <li
            className={
                "cursor-pointer flex flex-row justify-between px-3 py-2 items-center hover:bg-gray-100"
            }
            onClick={() => handleItemChange(item.value)}
        >
            <span
                className={classnames(
                    "leading-loose",
                    currentValue === item.value && "font-bold"
                )}
            >
                {item.caption}
            </span>
            {selectedValue === item.value && <BsCheck size={20} />}
        </li>
    )

    return (
        <div className="relative" ref={ref}>
            <div
                onClick={() => {
                    setIsListEnabled(!isListEnabled)
                }}
                className={classnames(
                    "relative flex flex-row justify-between items-center text-gray-600 border rounded-md group border-primary-200 hover:border-primary-300 cursor-pointer select-none px-3 py-2",
                    isListEnabled && "border-primary-300"
                )}
            >
                <span>{getDropdownItem(selectedValue).caption}</span>
                {isListEnabled ? (
                    <RiArrowUpSLine size={20} />
                ) : (
                    <RiArrowDownSLine size={20} />
                )}
            </div>
            <div
                hidden={!isListEnabled}
                className="fixed shadow-md rounded-md mt-1 bg-white select-none w-full h-52 overflow-y-scroll dropdown-list"
                style={{ maxWidth: "305px" }}
            >
                <ul>
                    {list.map((item: DropdownItem) => (
                        <ListItem item={item} key={item.value} />
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default TimeoutSelect
