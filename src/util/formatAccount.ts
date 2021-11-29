const WALLET_ADDRESS_DEFAULT_LENGTH = 40

export const formatHash = (hash: string, chars: number = 4) => {
    if (hash.length < WALLET_ADDRESS_DEFAULT_LENGTH || hash.length === chars) {
        return hash
    } else {
        return `${hash.substr(0, chars + 2)}...${hash.substr(-chars)}`
    }
}

export const formatName = (
    accountName: string | undefined,
    maxLength: number = 13
): string => {
    if (!accountName) {
        return 'Account'
    } else {
        if (accountName.length < maxLength) {
            return accountName
        } else {
            return `${accountName.substr(0, maxLength - 3)}...`
        }
    }
}
