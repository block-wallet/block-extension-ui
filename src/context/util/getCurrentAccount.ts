import { AccountInfo } from '@blank/background/controllers/AccountTrackerController'
import { Flatten } from '@blank/background/utils/types/helpers'
import { BlankAppUIState } from '@blank/background/utils/constants/initialState'

export const getCurrentAccount = (state: Flatten<BlankAppUIState>) =>
    state.accounts[
    state.selectedAddress.length > 0
        ? state.selectedAddress
        : Object.keys(state.accounts)[0]
    ] as AccountInfo
