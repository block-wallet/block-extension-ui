import React from "react"
import { render, screen } from "@testing-library/react"
import { MockPopup, MockTab } from "../mock/MockApp"
import { initBackgroundState } from "../context/background/backgroundContext"

test("Tab renders", () => {
    render(<MockTab location="/intro" />)

    const blank = screen.queryAllByText(/blank/i).length !== 0
    expect(blank).toBeTruthy()
})

test("PopUp renders", () => {
    render(
        <MockPopup
            location="/"
            assignBlankState={initBackgroundState.blankState}
        />
    )

    const privacy = screen.queryAllByText(/privacy/i).length !== 0
    expect(privacy).toBeTruthy()
})
