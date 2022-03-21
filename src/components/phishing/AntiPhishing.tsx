import React, { FunctionComponent } from "react"
import Tooltip from "../label/Tooltip"

const AntiPhishing: FunctionComponent<{
    image: string | undefined
}> = ({ image = "" }) => {
    if (!image) return <></>

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col space-y-2 items-end justify-end select-none">
                <div className="group relative">
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://help.blockwallet.io/hc/en-us/articles/4756464544657"
                    >
                        <img
                            src={image}
                            alt="anti-phishing"
                            width={175}
                            height={175}
                        />
                    </a>
                    <Tooltip
                        className="-translate-y-40 translate-x-3/4"
                        content={
                            <div className="flex flex-col font-normal items-start text-xs text-white-500 font-bold p-1">
                                <div className="flex flex-row items-end space-x-7">
                                    <span>Phishing Protection</span>{" "}
                                </div>
                                <div className="flex flex-row items-end space-x-4">
                                    <span>Click to learn more.</span>{" "}
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    )
}

export default AntiPhishing
