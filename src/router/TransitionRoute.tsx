import React, { useRef } from "react"
import { useMemo } from "react"
import { FunctionComponent } from "react"
import { Route, RouteProps, useLocation } from "react-router-dom"
import { useLastLocation } from "react-router-last-location"
import { CSSTransition } from "react-transition-group"
import { getPathDepth } from "../util/getPathDepth"

export type TransitionRouteProps = {
    transition?: string
    component: any
} & RouteProps

export const TransitionRoute: FunctionComponent<TransitionRouteProps> = ({
    transition,
    component: Component,
    ...rest
}) => {
    const location = useLocation()
    const lastLocation = useLastLocation()
    const pathName = location.pathname === "/home" ? "/" : location.pathname
    const lastPathName =
        lastLocation?.pathname === "/home" ? "/" : lastLocation?.pathname

    const nodeRef = useRef(null)
    // Transition logic:
    // -> to root "/" --> slide-up
    // -> from root to any module --> slide-down
    // -> from a level 1 page (for ex: /deposit) to any level 2 or same level subpage (for ex: /deposit/confirm) --> slide-left
    // -> from a level 2 page (for ex: /deposit/confirm) to a minor level page (for ex: /deposit) --> slide-right

    transition = useMemo(() => {
        if (
            lastPathName &&
            lastPathName !== "/" &&
            pathName !== "/" &&
            pathName !== "/unlock"
        ) {
            const currentDepth = getPathDepth(pathName)
            const lastDepth = getPathDepth(lastPathName)
            return lastDepth > currentDepth ? "slide-right" : "slide-left"
        } else {
            return pathName === "/" ? "slide-up" : "slide"
        }
    }, [lastPathName, pathName])

    return (
        <Route {...rest} component={transition ? undefined : Component}>
            {transition
                ? ({ match }) => (
                      <CSSTransition
                          in={match != null}
                          timeout={400}
                          classNames={transition}
                          unmountOnExit
                          nodeRef={nodeRef}
                      >
                          <div className="w-full h-full" ref={nodeRef}>
                              <Component />
                          </div>
                      </CSSTransition>
                  )
                : undefined}
        </Route>
    )
}
