import React, { useState } from "react"
import {
    TokenList,
    TokenWithBalance,
} from "../../../context/hooks/useTokensList"
import DropDownSelector from "../../input/DropDownSelector"
import SearchInput from "../../input/SearchInput"
import TokenDisplay from "../../TokenDisplay"
import { formatUnits } from "ethers/lib/utils"
import { formatRounded } from "../../../util/formatRounded"

// Types
interface AssetSelectionProps {
    register?: any
    error?: any
    setValue?: any
    assets: TokenList
    defaultAsset?: TokenWithBalance | undefined
    onAssetChange?: (asset: TokenWithBalance) => any
    topMargin?: number
    bottomMargin?: number
    popupMargin?: number
}

export const AssetSelection = (props: AssetSelectionProps) => {
    const {
        register,
        error,
        setValue,
        assets,
        defaultAsset,
        onAssetChange,
        topMargin,
        bottomMargin,
        popupMargin,
    } = props

    // State
    const [search, setSearch] = useState<string>("")
    const [isEmpty, setIsEmpty] = useState<boolean>(true)
    const [selectedToken, setSelectedToken] = useState<
        TokenWithBalance | undefined
    >(defaultAsset)
    const [inputValue, setInputValue] = useState<string | undefined>(
        defaultAsset?.token.address
    )

    // Handler
    const onChange = (event: any) => {
        const value = event.target.value
        // Update input value & check if empty
        setSearch(value)
        value === "" ? setIsEmpty(true) : setIsEmpty(false)
    }

    const onClick = (
        asset: TokenWithBalance,
        setActive: (state: boolean) => void
    ) => {
        setSelectedToken(asset)
        onAssetChange && onAssetChange(asset)
        setInputValue(asset.token.address)
        if (setValue) {
            setValue("asset", asset.token.address, {
                shouldValidate: true,
            })
        }
        setActive(false)
    }

    // Token filtering function
    const tokenFilter = ({ token }: TokenWithBalance) => {
        if (!isEmpty) {
            const name = token.name.toUpperCase()
            const symbol = token.symbol.toUpperCase()
            const uppercasedSearch = search.toUpperCase()
            return (
                name.includes(uppercasedSearch) ||
                symbol.includes(uppercasedSearch)
            )
        } else {
            return true
        }
    }

    // Subcomponent
    const Child = (props: any) => {
        return (
            <div className="py-6">
                <input
                    name="asset"
                    ref={register}
                    className="hidden"
                    value={inputValue}
                    onChange={() => {}}
                />
                {assets.filter(tokenFilter).map((asset: TokenWithBalance) => {
                    return (
                        <div
                            className="cursor-pointer"
                            key={`selected-${asset.token.address}`}
                            onClick={() => onClick(asset, props.setActive)}
                        >
                            <TokenDisplay
                                data={{
                                    address: asset.token.address,
                                    decimals: asset.token.decimals,
                                    logo: asset.token.logo,
                                    name: asset.token.name,
                                    symbol: asset.token.symbol,
                                    type: asset.token.type,
                                }}
                                clickable={false}
                                active={
                                    selectedToken?.token.address ===
                                    asset.token.address
                                        ? true
                                        : false
                                }
                                hoverable={true}
                            />
                        </div>
                    )
                })}
            </div>
        )
    }

    // Component
    return (
        <div className={!error ? "mb-3" : ""}>
            <div className="ml-1 mb-2 text-sm text-gray-600">Asset</div>
            <DropDownSelector
                title={
                    selectedToken
                        ? selectedToken.token.symbol
                        : "Select an asset"
                }
                subtitle={
                    selectedToken
                        ? `
          ${formatRounded(
              formatUnits(
                  selectedToken.balance || "0",
                  selectedToken.token.decimals
              ),
              4
          )}
            ${selectedToken.token.symbol}
          `
                        : ""
                }
                topMargin={topMargin || 0}
                bottomMargin={bottomMargin || 0}
                popupMargin={popupMargin || 16}
                error={error}
            >
                <div className="w-full p-6 pb-0">
                    <SearchInput
                        name="tokenName"
                        value={search}
                        placeholder="Search Tokens"
                        disabled={false}
                        autofocus={true}
                        onChange={onChange}
                    />
                </div>
                <Child />
            </DropDownSelector>
        </div>
    )
}
