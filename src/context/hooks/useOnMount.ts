import { useMemo } from 'react'
import { useHistory } from 'react-router'
import { useLocation } from 'react-router-dom'

export const useOnMountHistory = <T = any>() => {
    const history = useHistory<T>()
    return useMemo(() => ({ ...history }), []) as typeof history
}

export const useOnMountLocation = <T = any>() => {
    const location = useLocation<T>()
    return useMemo(() => ({ ...location }), []) as typeof location
}
