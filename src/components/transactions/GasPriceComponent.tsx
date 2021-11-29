import classnames from "classnames"
import { BigNumber } from "ethers"
import React, { FunctionComponent, useRef, useState } from "react"
import arrowDown from "../../assets/images/icons/arrow_down.svg"
import { Classes } from "../../styles"
import { capitalize } from "../../util/capitalize"
import { useOnClickOutside } from "../../util/useOnClickOutside"
import CloseIcon from "../icons/CloseIcon"
import HorizontalSelect from "../input/HorizontalSelect"
import eth from "../../assets/images/icons/ETH.svg"
import { ImCheckmark } from "react-icons/im"
import { useBlankState } from "../../context/background/backgroundHooks"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import { formatCurrency, toCurrencyAmount } from "../../util/formatCurrency"
import { formatRounded } from "../../util/formatRounded"
import { useEffect } from "react"
import {
    FeeData,
    GasPriceLevels,
} from "@blank/background/controllers/GasPricesController"
import * as yup from "yup"
import { InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import Tooltip from "../../components/label/Tooltip"
import { AiFillInfoCircle } from "react-icons/ai"
import ErrorMessage from "../error/ErrorMessage"
import { useGasPriceData } from "../../context/hooks/useGasPriceData"
import Spinner from "../Spinner"

interface GasComponentProps {
    symbol: string
    nativeCurrencyIcon: string
    gasFees: FeeData
    selectedOption: GasPriceOption
    options: GasPriceOption[]
    setSelectedGas: (option: GasPriceOption) => void
    getGasOption: (label: string, gasFees: FeeData) => GasPriceOption
}

interface GasPriceOption {
    label: string
    gasFees: FeeData
    //EIP-1559: range
    totalETHCost: string
    totalNativeCurrencyCost: string
}

type TransactionSpeed = {
    [key: string]: FeeData
}

const getTransactionSpeeds = (gasPrices: GasPriceLevels): TransactionSpeed => {
    return {
        low: {
            maxPriorityFeePerGas: BigNumber.from(
                gasPrices.slow.maxPriorityFeePerGas
            ),
            maxFeePerGas: BigNumber.from(gasPrices.slow.maxFeePerGas),
        },
        medium: {
            maxPriorityFeePerGas: BigNumber.from(
                gasPrices.average.maxPriorityFeePerGas
            ),
            maxFeePerGas: BigNumber.from(gasPrices.average.maxFeePerGas),
        },
        high: {
            maxPriorityFeePerGas: BigNumber.from(
                gasPrices.fast.maxPriorityFeePerGas
            ),
            maxFeePerGas: BigNumber.from(gasPrices.fast.maxFeePerGas),
        },
    }
}
// Basic Tab. Shows 3 levels of gas calculated with values received from state.
const GasSelectorBasic = (props: GasComponentProps) => {
    const {
        selectedOption,
        options,
        setSelectedGas,
        nativeCurrencyIcon,
        symbol,
    } = props

    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-col w-full space-y">
                {options.map((option) => (
                    <div
                        key={option.label}
                        className="w-full flex flex-row items-center p-2 cursor-pointer rounded-md hover:bg-gray-100"
                        onClick={() => {
                            setSelectedGas(option)
                        }}
                    >
                        <div className="flex flex-col flex-grow items-start px-2 py-1 w-11/12">
                            <label
                                className={classnames(
                                    "text-base font-semibold mb-2 cursor-pointer capitalize",
                                    selectedOption.label === option.label &&
                                        "text-primary-300"
                                )}
                            >
                                {option.label}
                            </label>{" "}
                            <div className="flex flex-row w-full items-center justify-start">
                                <div className="w-36">
                                    <span
                                        className={classnames(
                                            "text-xs",
                                            selectedOption.label ===
                                                option.label &&
                                                "text-primary-300"
                                        )}
                                    >
                                        {option.totalNativeCurrencyCost}
                                    </span>
                                </div>
                                <div className="flex flex-row space-x-2 items-center justify-start w-44">
                                    <div className="justify-self-start">
                                        <img
                                            src={nativeCurrencyIcon}
                                            alt={symbol}
                                            width="11px"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <span
                                            className={classnames(
                                                "text-xs",
                                                selectedOption.label ===
                                                    option.label &&
                                                    "text-primary-300"
                                            )}
                                        >
                                            {option.totalETHCost}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-1/12">
                            <ImCheckmark
                                className={classnames(
                                    "text-sm",
                                    selectedOption.label === option.label
                                        ? "text-primary-300"
                                        : "hidden"
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Schema
const GetAmountYupSchema = (
    gasLimit: BigNumber,
    maxPriorityFeePerGas: BigNumber,
    maxFeePerGas: BigNumber
) => {
    return yup.object({
        gasLimit: yup
            .string()
            .required("Gas Limit is required")
            .test("is-correct", "Please enter a number.", (value) => {
                if (typeof value != "string") return false
                return !isNaN(parseFloat(value))
            })
            .test("is-correct", "Please enter a number.", (value) => {
                if (typeof value != "string") return false
                const regexp = /^\d+(\.\d+)?$/
                return regexp.test(value)
            })
            .test(
                "is-correct",
                "Amount must be a positive number.",
                (value) => {
                    if (typeof value != "string") return false
                    return parseFloat(value) > 0
                }
            ),
        maxPriorityFeePerGas: yup
            .string()
            .required("Max tip is required")
            .test("is-correct", "Please enter a number.", (value) => {
                if (typeof value != "string") return false
                return !isNaN(parseFloat(value))
            })
            .test("is-correct", "Please enter a number.", (value) => {
                if (typeof value != "string") return false
                const regexp = /^\d+(\.\d+)?$/
                return regexp.test(value)
            })
            .test(
                "is-correct",
                "Amount must be a positive number.",
                (value) => {
                    if (typeof value != "string") return false
                    return parseFloat(value) > 0
                }
            ),
        maxFeePerGas: yup
            .string()
            .required("Max fee is required")
            .test("is-correct", "Please enter a number.", (value) => {
                if (typeof value != "string") return false
                return !isNaN(parseFloat(value))
            })
            .test("is-correct", "Please enter a number.", (value) => {
                if (typeof value != "string") return false
                const regexp = /^\d+(\.\d+)?$/
                return regexp.test(value)
            })
            .test(
                "is-correct",
                "Amount must be a positive number.",
                (value) => {
                    if (typeof value != "string") return false
                    return parseFloat(value) > 0
                }
            ),
    })
}

const schema = GetAmountYupSchema(
    BigNumber.from("0"),
    BigNumber.from("0"),
    BigNumber.from("0")
)
type GasAdvancedForm = InferType<typeof schema>

// Advanced tab. Allows users to enter manual fee values.
const GasSelectorAdvanced = (props: GasComponentProps) => {
    const { gasFees, selectedOption, getGasOption, setSelectedGas } = props
    const { baseFeePerGas, gasPrices } = useGasPriceData()

    const defaultFees: FeeData = {
        gasLimit: gasFees.gasLimit,
        maxPriorityFeePerGas:
            gasFees.maxPriorityFeePerGas ??
            BigNumber.from(gasPrices.average.maxPriorityFeePerGas),
        maxFeePerGas:
            gasFees.maxFeePerGas ??
            BigNumber.from(gasPrices.average.maxFeePerGas),
    }
    const [isCustom, setIsCustom] = useState<boolean>(
        selectedOption.label === "Custom"
    )
    const averageTip = BigNumber.from(gasPrices.average.maxPriorityFeePerGas)

    const {
        register,
        handleSubmit,
        errors,
        setValue,
        getValues,
    } = useForm<GasAdvancedForm>({
        defaultValues: {
            gasLimit: formatUnits(
                isCustom
                    ? selectedOption.gasFees.gasLimit!
                    : defaultFees.gasLimit!,
                "wei"
            ),
            maxPriorityFeePerGas: formatUnits(
                isCustom
                    ? selectedOption.gasFees.maxPriorityFeePerGas!
                    : defaultFees.maxPriorityFeePerGas!,
                "gwei"
            ),
            maxFeePerGas: formatUnits(
                isCustom
                    ? selectedOption.gasFees.maxFeePerGas!
                    : defaultFees.maxFeePerGas!,
                "gwei"
            ),
        },
        resolver: yupResolver(schema),
    })

    const handleCustomChange = () => {
        setIsCustom(true)
        setValue("gasLimit", formatUnits(defaultFees.gasLimit!, "wei"))
        setValue(
            "maxPriorityFeePerGas",
            formatUnits(defaultFees.maxPriorityFeePerGas!, "gwei")
        )
        setValue("maxFeePerGas", formatUnits(defaultFees.maxFeePerGas!, "gwei"))
    }

    const validateFees = (fees: FeeData): boolean => {
        // Clean errors
        setMaxFeeError("")
        setTipError("")

        // Variables
        let hasErrors = false
        const baseFee = BigNumber.from(baseFeePerGas)

        // Validations
        if (fees.maxFeePerGas?.lt(baseFee)) {
            setMaxFeeError("Max fee should be greater than base fee")
            hasErrors = true
        }

        if (fees.maxFeePerGas?.lt(baseFee.add(fees.maxPriorityFeePerGas!))) {
            setMaxFeeError("Max fee should be greater than base fee plus tip")
            hasErrors = true
        }

        if (fees.maxPriorityFeePerGas?.lt(averageTip)) {
            setTipError(
                `Tip should be greater than average tip of ${formatUnits(
                    averageTip,
                    "gwei"
                )} Gwei`
            )
            hasErrors = true
        }

        return hasErrors
    }

    const handleBlur = () => {
        const values = getValues()

        const fees: FeeData = {
            gasLimit: BigNumber.from(values.gasLimit),
            maxPriorityFeePerGas: parseUnits(
                values.maxPriorityFeePerGas,
                "gwei"
            ),
            maxFeePerGas: parseUnits(values.maxFeePerGas, "gwei"),
        }

        validateFees(fees)
    }

    const handleSave = handleSubmit(async (values: GasAdvancedForm) => {
        const fees: FeeData = {
            gasLimit: BigNumber.from(values.gasLimit),
            maxPriorityFeePerGas: parseUnits(
                values.maxPriorityFeePerGas,
                "gwei"
            ),
            maxFeePerGas: parseUnits(values.maxFeePerGas, "gwei"),
        }

        const custom = getGasOption("Custom", fees)
        setSelectedGas(custom)
    })

    const [tipError, setTipError] = useState("")
    const [maxFeeError, setMaxFeeError] = useState("")

    const handleKeyDown = (e: React.KeyboardEvent<any>) => {
        const amt = Number(e.currentTarget.value)
        if (
            !isNaN(Number(e.key)) &&
            !isNaN(amt) &&
            amt >= Number.MAX_SAFE_INTEGER
        ) {
            e.preventDefault()
            e.stopPropagation()
        }
    }

    const handleChangeGasLimit = (event: any) => {
        let value = event.target.value

        value = value
            .replace(",", ".")
            .replace(/[^0-9]/g, "")
            .replace(/(\..*?)\..*/g, "$1")

        if (!value || value === "" || value === ".") {
            value = defaultFees.gasLimit!.toString()
        }

        setValue("gasLimit", value, {
            shouldValidate: true,
        })
    }

    const handleChangeAmount = (
        field: "gasLimit" | "maxPriorityFeePerGas" | "maxFeePerGas",
        event: any
    ) => {
        let value = event.target.value

        value = value
            .replace(",", ".")
            .replace(/[^0-9.]/g, "")
            .replace(/(\..*?)\..*/g, "$1")

        if (!value || value === ".") {
            value = ""
        }

        setValue(field, value, {
            shouldValidate: true,
        })
    }

    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-col w-full space-y-3 px-3 pb-3">
                <div className="flex flex-col">
                    <label className="leading-loose text-xs font-medium mb-1 text-gra">
                        Gas Limit
                    </label>
                    <input
                        type="text"
                        name="gasLimit"
                        ref={register}
                        className={classnames(
                            Classes.inputBordered,
                            !isCustom && "text-gray-400"
                        )}
                        autoComplete="off"
                        onKeyDown={handleKeyDown}
                        onInput={handleChangeGasLimit}
                        placeholder={formatUnits(
                            isCustom
                                ? selectedOption.gasFees.gasLimit!
                                : defaultFees.gasLimit!,
                            "wei"
                        )}
                        onFocus={() => {
                            !isCustom && handleCustomChange()
                        }}
                        onBlur={() => {
                            handleBlur()
                        }}
                        tabIndex={1}
                    />
                </div>
                <div className="flex flex-col relative">
                    <label className="leading-loose text-xs font-medium  mb-1">
                        Max Tip (per gas)
                    </label>
                    <div className="flex flex-row relative w-full">
                        <input
                            type="text"
                            name="maxPriorityFeePerGas"
                            ref={register}
                            className={classnames(
                                Classes.inputBordered,
                                "w-full",
                                !isCustom && "text-gray-400",
                                (errors.maxPriorityFeePerGas || tipError) &&
                                    "border-red-400 focus:border-red-600"
                            )}
                            autoComplete="off"
                            onKeyDown={handleKeyDown}
                            onInput={handleChangeAmount.bind(
                                this,
                                "maxPriorityFeePerGas"
                            )}
                            placeholder={formatUnits(
                                isCustom
                                    ? selectedOption.gasFees
                                          .maxPriorityFeePerGas!
                                    : defaultFees.maxPriorityFeePerGas!,
                                "gwei"
                            )}
                            onFocus={() => {
                                !isCustom && handleCustomChange()
                            }}
                            onBlur={() => {
                                handleBlur()
                            }}
                            tabIndex={2}
                        />
                        <div
                            className={classnames(
                                "absolute inset-y-0 right-8 flex items-center"
                            )}
                        >
                            <span className="text-gray-500 text-sm">GWEI</span>
                        </div>
                    </div>
                    {/* ERROR */}
                    <span
                        className={classnames(
                            "text-xs text-red-500",
                            !errors.maxPriorityFeePerGas && !tipError
                                ? "m-0 h-0"
                                : ""
                        )}
                    >
                        {errors.maxPriorityFeePerGas?.message || tipError || ""}
                    </span>
                </div>
                <div className="flex flex-col relative">
                    <label className="leading-loose text-xs font-medium  mb-1">
                        Max Price (per gas)
                    </label>
                    <div className="flex flex-row relative w-full">
                        <input
                            type="text"
                            name="maxFeePerGas"
                            ref={register}
                            className={classnames(
                                Classes.inputBordered,
                                "w-full",
                                !isCustom && "text-gray-400",
                                (errors.maxFeePerGas || maxFeeError) &&
                                    "border-red-400 focus:border-red-600"
                            )}
                            autoComplete="off"
                            onKeyDown={handleKeyDown}
                            onInput={handleChangeAmount.bind(
                                this,
                                "maxFeePerGas"
                            )}
                            placeholder={formatUnits(
                                isCustom
                                    ? selectedOption.gasFees.maxFeePerGas!
                                    : defaultFees.maxFeePerGas!,
                                "gwei"
                            )}
                            onFocus={() => {
                                !isCustom && handleCustomChange()
                            }}
                            onBlur={() => {
                                handleBlur()
                            }}
                            tabIndex={3}
                        />
                        <div
                            className={classnames(
                                "absolute inset-y-0 right-8 flex items-center"
                            )}
                        >
                            <span className="text-gray-500 text-sm">GWEI</span>
                        </div>
                    </div>
                    {/* ERROR */}
                    <span
                        className={classnames(
                            "text-xs text-red-500",
                            !errors.maxFeePerGas && maxFeeError === ""
                                ? "m-0 h-0"
                                : ""
                        )}
                    >
                        {errors.maxFeePerGas?.message || maxFeeError || ""}
                    </span>
                </div>
                <span className="text-gray-500 text-xs">
                    Last base fee: {formatUnits(baseFeePerGas!, "gwei")} GWEI
                </span>
            </div>
            <div>
                <hr className="absolute left-0 border-0.5 border-gray-200 w-full" />
                <div className="flex flex-row w-full items-center pt-5 justify-between space-x-4 mt-auto px-4">
                    <button
                        type="button"
                        className={classnames(Classes.button)}
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

const tabs = [
    {
        label: "Basic",
        component: GasSelectorBasic,
    },
    {
        label: "Advanced",
        component: GasSelectorAdvanced,
    },
]

// Main Component
const GasPriceComponent: FunctionComponent<{
    defaultGas: { feeData: FeeData; defaultLevel?: "low" | "medium" | "high" } // can receive either custom values (i.e. dApps or estimation) or a level to set as default basic value
    setGas: (gasFees: FeeData) => void
    disabled?: boolean
    isParentLoading?: boolean
    showEstimationError?: boolean
}> = ({
    defaultGas,
    setGas,
    isParentLoading,
    disabled,
    showEstimationError,
}) => {
    //Popup variables
    const ref = useRef(null)
    const [active, setActive] = useState(false)
    useOnClickOutside(ref, () => setActive(false))

    //State
    const {
        exchangeRates,
        nativeCurrency,
        localeInfo,
        networkNativeCurrency,
    } = useBlankState()!

    const { baseFeePerGas, gasPrices } = useGasPriceData()

    const {
        iconUrls,
        nativeCurrency: { decimals: nativeCurrencyDecimals },
    } = useSelectedNetwork()
    const defaultNetworkLogo = iconUrls ? iconUrls[0] : eth

    const [baseFee, setBaseFee] = useState<BigNumber>(
        BigNumber.from(baseFeePerGas)
    )

    const [estimationError, setEstimationError] = useState(showEstimationError)

    const [
        transactionSpeeds,
        setTransactionSpeeds,
    ] = useState<TransactionSpeed>(getTransactionSpeeds(gasPrices))

    const getGasOption = (label: string, gasFees: FeeData) => {
        // MinValue: (baseeFee + tip) * gasLimit
        // We assume that the baseFee could at most be reduced 25% in next 2 blocks so for calculating the min value we apply that reduction.

        // 25% of BaseFee => (baseFee * 25) / 100
        const percentage = baseFee
            .mul(BigNumber.from(25))
            .div(BigNumber.from(100))
        const minBaseFee = baseFee.sub(percentage)

        const minValue = minBaseFee
            .add(gasFees.maxPriorityFeePerGas!)
            .mul(gasFees.gasLimit!)

        // MaxValue: maxFeePerGas * gasLimit
        const maxValue = gasFees.maxFeePerGas!.mul(gasFees.gasLimit!)

        // When the user is applying a custom value, we check if the maxValue calculated is lower than the minValue, it means that the maxFee that the user is willing
        // to pay is lower than the min value calculated using baseFee + tip, so we will only display that value and not a range

        const minValueNativeCurrency = formatCurrency(
            toCurrencyAmount(
                minValue.lt(maxValue) ? minValue : maxValue,
                exchangeRates[networkNativeCurrency.symbol],
                nativeCurrencyDecimals
            ),
            {
                currency: nativeCurrency,
                locale_info: localeInfo,
                showCurrency: false,
                showSymbol: true,
            }
        )

        const maxValueNativeCurrency = formatCurrency(
            toCurrencyAmount(
                minValue.gt(maxValue) ? minValue : maxValue,
                exchangeRates[networkNativeCurrency.symbol],
                nativeCurrencyDecimals
            ),
            {
                currency: nativeCurrency,
                locale_info: localeInfo,
                showCurrency: false,
                showSymbol: true,
            }
        )

        const totalETHCost =
            label !== "Custom" || minValue.lte(maxValue)
                ? `${formatRounded(
                      formatUnits(minValue.lt(maxValue) ? minValue : maxValue),

                      5
                  )} - ${formatRounded(
                      formatUnits(minValue.gt(maxValue) ? minValue : maxValue),
                      5
                  )}`
                : `${formatRounded(formatUnits(maxValue), 5)}`

        return {
            label,
            gasFees,
            totalETHCost,
            totalNativeCurrencyCost:
                label !== "Custom" || minValue.lte(maxValue)
                    ? `${minValueNativeCurrency} - ${maxValueNativeCurrency}`
                    : maxValueNativeCurrency,
        } as GasPriceOption
    }

    const [gasOptions, setGasOptions] = useState<GasPriceOption[]>([])

    // Selected gas state
    const [selectedGas, setSelectedGas] = useState<GasPriceOption>()

    // Tabs variables
    const [tab, setTab] = useState(tabs[!defaultGas.defaultLevel ? 1 : 0])
    const TabComponent = tab.component
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    // Effects
    useEffect(() => {
        // Waits till parent component finishes loading (estimation and transaction values)
        if (isParentLoading) {
            // This means there was a change on parent component that is updating values so we should reload all values.
            if (isLoaded) setIsLoaded(false)

            // keeps waiting for parent to finish
            return
        }

        //Update transaction speeds
        setTransactionSpeeds(getTransactionSpeeds(gasPrices))

        //Get & set gas options
        let speedOptions: GasPriceOption[] = []
        for (let speed in transactionSpeeds) {
            speedOptions.push(
                getGasOption(speed, {
                    gasLimit: defaultGas.feeData.gasLimit,
                    maxPriorityFeePerGas:
                        transactionSpeeds[speed].maxPriorityFeePerGas,
                    maxFeePerGas: transactionSpeeds[speed].maxFeePerGas,
                })
            )
        }
        setGasOptions(speedOptions)

        // First load will check if comp received default values or level
        if (!isLoaded) {
            // If the default gas was set to a basic level, update the selected option with the new gas values
            if (defaultGas.defaultLevel) {
                const defaultOption = speedOptions.find(
                    (s) => s.label === defaultGas.defaultLevel
                )

                if (defaultOption) {
                    setSelectedGas(defaultOption)
                    setGas(defaultOption.gasFees!)
                    setTab(tabs[0])
                }
            } else {
                // If the default gas was set to custom values, update them and set the advance tab as active
                const defaultOption = getGasOption("Custom", defaultGas.feeData)
                setSelectedGas(defaultOption)
                setGas(defaultOption.gasFees!)
                setTab(tabs[1])
            }
        }

        setIsLoaded(true)

        //Updated selected gas on gas price change
        if (isLoaded && selectedGas!.label !== "Custom") {
            const selected = speedOptions.find(
                (s) => s.label === selectedGas!.label
            )
            if (selected) {
                setSelectedGas(selected)
                setGas(selectedGas!.gasFees!)
            }
        }

        setEstimationError(showEstimationError)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isParentLoading, gasPrices, defaultGas.feeData.gasLimit])

    useEffect(() => {
        setBaseFee(BigNumber.from(baseFeePerGas))
    }, [baseFeePerGas])

    return (
        <>
            {/* Label */}
            <div
                className={classnames(
                    Classes.blueSection,
                    active && Classes.blueSectionActive
                )}
                onClick={() =>
                    !disabled &&
                    !isParentLoading &&
                    isLoaded &&
                    setActive(!active)
                }
            >
                <div className="flex flex-col justify-center w-full h-11">
                    <div className={"text-base font-semibold mb-1"}>
                        {isParentLoading || !isLoaded
                            ? "Loading prices..."
                            : capitalize(selectedGas!.label)}
                    </div>

                    <div className="flex flex-row w-full items-center justify-between">
                        <div className="">
                            <span className="text-xs text-gray-600">
                                {!isParentLoading && isLoaded
                                    ? selectedGas!.totalNativeCurrencyCost
                                    : ""}
                            </span>
                        </div>
                        <div className="flex flex-row space-x-2 items-center justify-self-end">
                            {!isParentLoading && isLoaded && (
                                <>
                                    <div className="justify-self-start">
                                        <img
                                            src={defaultNetworkLogo}
                                            alt={networkNativeCurrency.symbol}
                                            width="11px"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <span className="text-xs">
                                            {selectedGas!.totalETHCost}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center w-8 h-full">
                    {isParentLoading || !isLoaded ? (
                        <Spinner />
                    ) : (
                        <img
                            src={arrowDown}
                            className="w-3 h-2"
                            alt=""
                            style={{
                                transform: `${
                                    active ? "rotate(180deg)" : "none"
                                }`,
                            }}
                        />
                    )}
                </div>
            </div>
            {estimationError && (
                <div className="pl-1">
                    <ErrorMessage error="Gas estimation failed, transaction might fail." />
                </div>
            )}
            {/* Modal */}
            {active && (
                <div
                    className="bg-white bg-opacity-80 fixed inset-0 w-full h-screen z-50 overflow-hidden flex flex-col items-center justify-center px-6"
                    style={{ maxWidth: "390px", maxHeight: "600px" }}
                >
                    <div
                        ref={ref}
                        className="relative py-6 px-3 opacity-100 w-full bg-white shadow-md rounded-md flex-col flex"
                    >
                        <span className="absolute top-0 right-0 p-4 z-50">
                            <div
                                onClick={() => setActive(false)}
                                className=" cursor-pointer p-2 ml-auto -mr-2 text-gray-900 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300"
                            >
                                <CloseIcon size="10" />
                            </div>
                        </span>
                        <div>
                            <div className="flex flex-col w-full space-y-2">
                                <div className="z-10 flex flex-row items-center p-2 bg-white bg-opacity-75">
                                    <h2 className="px-2 pr-0 text-lg font-bold">
                                        Gas Price
                                    </h2>
                                    <div className="group relative">
                                        <a
                                            href="https://ethereum.org/en/developers/docs/gas/"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <AiFillInfoCircle
                                                size={26}
                                                className="pl-2 text-primary-200 cursor-pointer hover:text-primary-300"
                                            />
                                        </a>
                                        <Tooltip
                                            content={
                                                <div className="flex flex-col font-normal items-start text-xs text-white-500">
                                                    <div className="flex flex-row items-end space-x-7">
                                                        <span>
                                                            Gas is used to
                                                            operate on the
                                                            network.
                                                        </span>{" "}
                                                    </div>
                                                    <div className="flex flex-row items-end space-x-4">
                                                        <span>
                                                            Click on this icon
                                                            to learn more.
                                                        </span>{" "}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </div>
                                </div>
                                <HorizontalSelect
                                    options={tabs}
                                    value={tab}
                                    onChange={setTab}
                                    display={(t) => t.label}
                                    disableStyles
                                    optionClassName={(value) =>
                                        `flex-1 flex flex-row items-center justify-center p-3 text-sm
                                            ${
                                                tab === value
                                                    ? "border-primary-300 border-b-2 text-primary-300 font-bold"
                                                    : "border-gray-200 text-gray-500 border-b"
                                            }`
                                    }
                                    containerClassName="flex flex-row -ml-3"
                                    containerStyle={{
                                        width: "calc(100% + 1.5rem)",
                                    }}
                                />
                                <TabComponent
                                    symbol={networkNativeCurrency.symbol}
                                    nativeCurrencyIcon={defaultNetworkLogo}
                                    options={gasOptions}
                                    gasFees={defaultGas.feeData}
                                    selectedOption={selectedGas!}
                                    setSelectedGas={(
                                        option: GasPriceOption
                                    ) => {
                                        setSelectedGas(option)
                                        setGas(option.gasFees)
                                        setEstimationError(false)
                                        setActive(false)
                                    }}
                                    getGasOption={getGasOption}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default GasPriceComponent
