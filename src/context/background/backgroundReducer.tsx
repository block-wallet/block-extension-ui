import { Messages } from '../commTypes'
import { BackgroundStateType } from './backgroundContext'
import type { MessageTypes } from '@blank/background/utils/types/communication'

type BackgroundAction = {
    type: MessageTypes
    payload?: any
}
const BackgroundReducer = (state: BackgroundStateType, action: BackgroundAction) => {
    switch (action.type) {
        case Messages.STATE.SUBSCRIBE:
            return {
                ...state,
                blankState: action.payload,
            }
        default:
            return state
    }
}

export default BackgroundReducer