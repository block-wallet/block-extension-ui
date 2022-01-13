import { BigNumber } from "ethers"
import { Token } from "@blank/background/controllers/erc-20/Token"
import eth from "../../assets/images/icons/ETH.svg"

import { useSelectedAccount } from "./useSelectedAccount"
import { useSelectedNetwork } from "./useSelectedNetwork"

export type TokenWithBalance = { token: Token; balance: BigNumber }

export type TokenList = TokenWithBalance[]

export const useTokensList = () => {
    const { balances } = useSelectedAccount()
    const { nativeCurrency, iconUrls, chainId } = useSelectedNetwork()
    const defaultNetworkLogo = iconUrls ? iconUrls[0] : eth

    const nativeToken = {
        address: "0x0",
        decimals: nativeCurrency.decimals,
        name: nativeCurrency.name,
        symbol: nativeCurrency.symbol,
        logo: defaultNetworkLogo,
    }

    if (chainId in balances) {
        const { nativeTokenBalance, tokens } = balances[chainId]

        // Place tokens with balance on top
        const currentNetworkTokens = Object.values(tokens)
            .filter((token) => {
                return !(
                    token.token.address in
                    ["0x0000000000000000000000000000000000000000", "0x0"]
                )
            })
            .sort((a, b) => {
                const firstNumber = BigNumber.from(b.balance)
                return firstNumber.gt(a.balance)
                    ? 1
                    : firstNumber.eq(a.balance)
                    ? 0
                    : -1
            })

        return {
            nativeToken: {
                token: nativeToken,
                balance: nativeTokenBalance,
            } as TokenWithBalance,
            currentNetworkTokens,
        }
    } else {
        return {
            nativeToken: {
                token: nativeToken,
                balance: BigNumber.from("0"),
            } as TokenWithBalance,
            currentNetworkTokens: [],
        }
    }
}
