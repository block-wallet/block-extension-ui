import React, { useState, FunctionComponent } from 'react'

// Assets
import unknownTokenIcon from '../assets/images/unknown_token.svg'
import checkmarkMiniIcon from '../assets/images/icons/checkmark_mini.svg'

// Types
import { TokenResponse } from '../routes/settings/AddTokensPage'
type TokenDisplayType = {
    data: TokenResponse
    clickable?: boolean
    active?: boolean | false
    hoverable?: boolean | false
}

/**
 * TokenDisplay:
 * Creates a display element to show token informations.
 * Can or cannot be clicked to show a selected style.
 * Can show a selected style.
 *
 * @param data - Object containing token to display's informations.
 * @param clickable - Determines if you can click element to show selected style.
 * @param active - Determines if the element is already showing selected style.
 * @param hoverable - Determines if the element shows an hover style.
 */
const TokenDisplay: FunctionComponent<TokenDisplayType> = ({
    data,
    clickable,
    active,
    hoverable,
}) => {
    // State
    const [selected, setSelected] = useState<boolean>(active ? active : false)

    const chars = 20
    const printSymbol = (symbol: string, name: string) => {
        if (symbol.length < chars - name.length) {
            return symbol
        } else {
            if (name.length < chars - 2) {
                return `${symbol.substr(0, chars - 2 - name.length)}..`
            } else {
                return `${symbol.substr(0, 3)}..`
            }
        }
    }
    const printName = (name: string, symbol: string) => {
        if (name.length < chars - symbol.length) {
            return name
        } else {
            return `${name.substr(0, chars - 5)}..`
        }
    }

    // Render
    return (
        <div
            className={`
        flex justify-between items-center flex-row relative px-3 mt-1 rounded-md transition-all duration-300 active:scale-95
        ${clickable ? 'cursor-pointer' : null}
        ${selected ? 'bg-primary-200' : null}
        ${hoverable ? 'hover:bg-primary-100' : null}
      `}
            onClick={() => (clickable ? setSelected(!selected) : null)}
        >
            <img
                src={checkmarkMiniIcon}
                alt="checkmark"
                className={`
          absolute mr-6 right-0
          ${selected ? 'visible' : 'hidden'}
        `}
            />
            <div className="flex justify-start items-center flex-row py-3">
                <div className="flex flex-row items-center justify-center w-9 h-9 p-1.5 bg-white border border-gray-200 rounded-full">
                    <img
                        src={data.logo === '' ? unknownTokenIcon : data.logo}
                        alt={data.name}
                        className="rounded-full"
                    />
                </div>
                <div className="flex justify-start items-center h-full ml-4 box-border">
                    <span className="text-base text-black font-semibold mr-1">
                        {printName(data.name, data.symbol)}
                    </span>
                    <span className="text-base text-gray-400">
                        {printSymbol(data.symbol, data.name)}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default TokenDisplay
