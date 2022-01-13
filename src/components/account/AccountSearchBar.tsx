import classnames from "classnames"
import React, { FunctionComponent, useEffect, useRef, useState } from "react"
import { ActionButton } from "../button/ActionButton"

// Assets
import accountAdd from "../../assets/images/icons/account_add.svg"
import searchIcon from "../../assets/images/icons/search.svg"
import CloseIcon from "../icons/CloseIcon"

const AccountSearchBar: FunctionComponent<{
    createAccountTo?: string
    onChange: (value: string) => void
    setIsSearching: (isSearching: boolean) => void
}> = ({ createAccountTo = "/accounts/create", onChange, setIsSearching }) => {
    const [searchBarVisible, setSearchBarVisible] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        searchBarVisible && inputRef.current!.focus()
    }, [searchBarVisible])

    const onValueChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(e.target.value)
    }

    return (
        <div
            className={classnames(
                "flex justify-between",
                !searchBarVisible && "space-x-2"
            )}
        >
            <div
                className={classnames(
                    "transition-opacity  duration-75    ",
                    !searchBarVisible
                        ? "w-5/6 delay-300 opacity-100"
                        : "w-0 opacity-0 "
                )}
            >
                {!searchBarVisible && (
                    <ActionButton
                        icon={accountAdd}
                        label="Create New Account"
                        to={createAccountTo}
                    />
                )}
            </div>
            <div
                className={classnames(
                    "flex flex-row items-center bg-white border border-gray-200 hover:border-black justify-between",
                    "h-12 space-x-2 p-4 rounded-md text-sm font-bold text-black",
                    "transition-width",
                    !searchBarVisible
                        ? "w-1/6 duration-100  cursor-pointer"
                        : "w-full delay-150 duration-500"
                )}
                onClick={() => {
                    if (!searchBarVisible) {
                        setSearchBarVisible(true)
                        setIsSearching(true)
                    }
                }}
            >
                <img src={searchIcon} alt="search" />

                <input
                    ref={inputRef}
                    className={classnames(
                        "bg-transparent p-0 border-none w-10/12",
                        "transition-opacity ",
                        !searchBarVisible
                            ? "opacity-0 w-0 "
                            : "opacity-100 duration-100 delay-500"
                    )}
                    placeholder="Search for Account"
                    onChange={onValueChanged}
                />
                <button
                    className={classnames(
                        "w-1/12 hover:text-primary-300",
                        "transition-opacity  ",
                        !searchBarVisible
                            ? "opacity-0 duration-75"
                            : "opacity-100 delay-500 duration-75"
                    )}
                    onClick={() => {
                        inputRef.current!.value = ""
                        setSearchBarVisible(false)
                        setIsSearching(false)
                    }}
                >
                    <CloseIcon size="12" />
                </button>
            </div>
        </div>
    )
}

export default AccountSearchBar
