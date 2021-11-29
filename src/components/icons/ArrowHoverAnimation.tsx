import React, { FunctionComponent } from "react"
import styled, { keyframes } from "styled-components"

import arrow from "../../assets/images/icons/arrow_margin.svg"

const HoverAnimation = styled.div`
    background-repeat: repeat;
    background-position-y: 0;
    :hover {
        animation: ${keyframes`
      from {
        background-position-y: 0;
      }
      to {
        background-position-y: 4rem;
      }
    `} 0.4s backwards;
    }
`

const ArrowHoverAnimation: FunctionComponent = ({ children }) => (
    <HoverAnimation
        className="w-full h-full"
        style={{
            backgroundImage: `url(${arrow})`,
            backgroundSize: "32px 32px",
            backgroundPosition: "center",
        }}
    >
        {children}
    </HoverAnimation>
)

export default ArrowHoverAnimation
