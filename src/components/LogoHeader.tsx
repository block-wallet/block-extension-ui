import React from "react"

import logo from "../assets/images/logo.svg"

const LogoHeader = () => (
    <div className="flex flex-row items-center space-x-1 text-black">
        <img src={logo} alt="logo" className="w-5 h-5 rounded-md" />
        <span className="font-bold text-lg">BlockWallet</span>
    </div>
)

export default LogoHeader
