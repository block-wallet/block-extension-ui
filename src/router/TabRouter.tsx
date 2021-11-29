import React, { FunctionComponent } from 'react'
import { HashRouter } from 'react-router-dom'
import { useBlankState } from '../context/background/backgroundHooks'
import IntroductionPage from '../routes/IntroductionPage'
import BackupConfirmPage from '../routes/setup/BackupConfirmPage'
import BackupNoticePage from '../routes/setup/BackupNoticePage'
import PasswordSetupPage from '../routes/setup/PasswordSetupPage'
import SeedImportPage from '../routes/setup/SeedImportPage'
import SetupDonePage from '../routes/setup/SetupDonePage'
import SetupPage from '../routes/setup/SetupPage'
import ResetPage from '../routes/setup/ResetPage'
import ResetDonePage from '../routes/setup/ResetDonePage'
import { makeRoutes } from '../util/makeRoutes'

const introRoutes = makeRoutes([
    /* Setup */
    { path: '/intro', exact: true, component: IntroductionPage },
    { path: '/setup', exact: true, component: SetupPage },
    { path: '/setup/import', exact: true, component: SeedImportPage },
    { path: '/setup/create', exact: true, component: PasswordSetupPage },
    { path: '/setup/create/notice', exact: true, component: BackupNoticePage },
    { path: '/setup/create/verify', exact: true, component: BackupConfirmPage },
    { path: '/setup/done', exact: true, component: SetupDonePage },
    { path: '/reset', exact: true, component: ResetPage },
    { path: '/reset/done', exact: true, component: ResetDonePage },
])

const TabRouter: FunctionComponent = ({ children }) => {
    const state = useBlankState()!
    const rootComponent = state?.isOnboarded ? SetupDonePage : IntroductionPage
    return (
        <HashRouter>
            {makeRoutes([{ path: '/', exact: true, component: rootComponent }])}
            {introRoutes}
            {children}
        </HashRouter>
    )
}

export default TabRouter
