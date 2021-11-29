import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"

// Components
import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import Divider from "../../components/Divider"
import SearchInput from "../../components/input/SearchInput"
import TokenDisplay from "../../components/TokenDisplay"
import TextInput from "../../components/input/TextInput"

// Utils
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import * as yup from "yup"
import { InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

// Comm
import { searchTokenInAssetsList } from "../../context/commActions"

// Assets
import searchIcon from "../../assets/images/icons/search.svg"
import { utils } from "ethers/lib/ethers"
import PageLayout from "../../components/PageLayout"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"

// Main component
const AddTokensPage = () => {
    const header = PopupHeader({ title: "Add Tokens", close: "/" })

    return (
        <PageLayout screen className="max-h-screen">
            <div className="absolute top-0 left-0 w-full">
                {header}
                <Divider />
            </div>
            <div className="invisible w-full">{header}</div>
            <div className="flex flex-col flex-1 w-full">
                <SearchToken />
            </div>
        </PageLayout>
    )
}

// Types
export type TokenResponse = {
    address: string
    decimals: number | undefined
    logo: string
    name: string
    symbol: string
    type: string
}

// Schema
const searchTokenSchema = yup.object().shape({
    tokenName: yup
        .string()
        .test("is-empty", "Token name is empty", (s) => {
            return !!s && s.trim().length > 0
        })
        .required("Please enter a token name"),
})
type searchTokenFormData = InferType<typeof searchTokenSchema>

const customTokenSchema = yup.object().shape({
    tokenAddress: yup
        .string()
        .test("is-empty", "Token contract address is empty", (s) => {
            return !!s && s.trim().length > 0
        })
        .required("Please enter a contract address"),
    tokenSymbol: yup
        .string()
        .test("is-empty", "Token symbol is empty", (s) => {
            return !!s && s.trim().length > 0
        })
        .required("Please enter a token symbol"),
    tokenDecimals: yup
        .string()
        .test("is-empty", "Token decimals is empty", (s) => {
            return !!s && s.trim().length > 0
        })
        .required("Please enter token decimals"),
})
type customTokenFormData = InferType<typeof customTokenSchema>

// Sub components
const SearchToken = () => {
    const history = useOnMountHistory()
    const { register, handleSubmit, setError } = useForm<searchTokenFormData>({
        resolver: yupResolver(searchTokenSchema),
    })

    // State
    const [isSearchEmpty, setIsSearchEmpty] = useState<boolean>(true)
    const [results, setResults] = useState<TokenResponse[]>([])
    const [selected, setSelected] = useState<TokenResponse[]>([])
    const [message, setMessage] = useState<string>("")
    const [isCustomTokenView, setIsCustomTokenView] = useState<boolean>(false)
    const [tokenAddress, setTokenAddress] = useState<string>("")

    useEffect(() => {
        if (results) {
            setIsCustomTokenView(false)
        } else {
            setIsCustomTokenView(true)
        }
        setTokenAddress("")
    }, [results])

    // Handlers
    const onSubmit = handleSubmit(async () => {
        try {
            // Valid form data
            if (selected.length > 0) {
                history.push({
                    pathname: "/settings/tokens/add/confirm",
                    state: { tokens: selected },
                })
            } else {
                // Prevent manual form submission
                setMessage("Please select a token first.")
            }
        } catch (event) {
            // Invalid form data
            console.log(event)
        }
    })

    const onChange = (event: any) => {
        const value = event.target.value
        // Update input value & check if empty
        value === "" ? setIsSearchEmpty(true) : setIsSearchEmpty(false)

        // If user puts address - show custom token view
        if (utils.isAddress(value) && value !== "") {
            setIsCustomTokenView(true)
            setTokenAddress(value)
            setSelected([])
        } else if (/^[a-zA-Z0-9_.-]*$/.test(value) && value !== "") {
            // Accept only number, letters and - . _
            searchTokenInAssetsList(value.toUpperCase())
                .then((res) => {
                    const exacts = res.filter(
                        (r) => r.symbol.toLowerCase() === value.toLowerCase()
                    )
                    const others = res.filter(
                        (r) => r.symbol.toLowerCase() !== value.toLowerCase()
                    )

                    return setResults([...exacts, ...others])
                })
                .catch((err) => console.log(err))
        } else {
            setResults([])
        }
    }

    const onClick = (token: TokenResponse) => {
        // Check if the token is already selected
        if (!selected.some((el) => el.address === token.address)) {
            // Add selected token
            addToken(token)

            // Reset message
            if (message !== "") {
                setMessage("")
            }
        } else {
            // Remove selected token
            removeToken(token)
        }
    }

    // Functions
    const addToken = (token: TokenResponse) => {
        setSelected(selected.concat(token))
    }

    const removeToken = (token: TokenResponse) => {
        setSelected(selected.filter((el) => el.address !== token.address))
    }

    return (
        <>
            <form
                id="search-form"
                className={`flex flex-col justify-between w-full ${
                    !isCustomTokenView ? " h-full" : ""
                } `}
                onSubmit={onSubmit}
            >
                <div className="flex-1 flex flex-col w-full h-0 max-h-screen overflow-auto">
                    <div className="flex flex-col flex-1 w-full">
                        <div
                            className={` ${
                                !isCustomTokenView ? "h-full" : "mb-6"
                            } `}
                        >
                            {/* INPUT */}
                            <div className="w-full p-6 pb-0">
                                <SearchInput
                                    name="tokenName"
                                    ref={register}
                                    placeholder="Search Tokens or fill in Address"
                                    disabled={false}
                                    autofocus={true}
                                    onChange={onChange}
                                />
                            </div>

                            {/* ERROR */}
                            <div
                                className={`text-xs px-6 text-red-500 ${
                                    message === "" ? "pt-0 h-0" : "pt-2"
                                }`}
                            >
                                {message || <>&nbsp;</>}
                            </div>

                            {!isCustomTokenView && (
                                <>
                                    {/* HINT */}
                                    {isSearchEmpty && selected.length <= 0 ? (
                                        <div className="flex flex-col items-center justify-start flex-1 h-full p-6">
                                            <div className="flex justify-center items-center relative mb-6">
                                                <img
                                                    src={searchIcon}
                                                    alt="search"
                                                    className="w-7 h-7 absolute z-10"
                                                />
                                                <div className="w-20 h-20 bg-primary-100 rounded-full relative z-0"></div>
                                            </div>
                                            <span className="text-sm text-gray-600 text-center">
                                                Add the tokens that you've
                                                acquired using Blank Wallet.
                                                <br />
                                                Enter an address for adding a
                                                custom token.
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 flex flex-col w-full h-0 max-h-screen px-6 pb-0">
                                                <div
                                                    className={`text-sm text-grey-200 p-6 pb-0 ${
                                                        selected.length <= 0
                                                            ? "hidden"
                                                            : "visible"
                                                    }`}
                                                >
                                                    Selected Tokens
                                                </div>
                                                <div className="flex flex-col">
                                                    {selected.map((select) => {
                                                        // Selected tokens
                                                        return (
                                                            <div
                                                                className="cursor-pointer"
                                                                key={`selected-${select.address}`}
                                                                onClick={() =>
                                                                    onClick(
                                                                        select
                                                                    )
                                                                }
                                                            >
                                                                <TokenDisplay
                                                                    data={
                                                                        select
                                                                    }
                                                                    clickable={
                                                                        false
                                                                    }
                                                                    active={
                                                                        true
                                                                    }
                                                                    hoverable={true}
                                                                />
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div
                                                    className={`text-sm text-grey-200 p-6 pb-0 ${
                                                        isSearchEmpty
                                                            ? "hidden"
                                                            : "visible"
                                                    }`}
                                                >
                                                    Search Tokens
                                                </div>
                                                <div className="flex flex-col">
                                                    {results.length < 1 &&
                                                    selected.length <= 0 ? (
                                                        <div className="text-base font-bold text-black w-full text-center mt-4">
                                                            No match
                                                        </div>
                                                    ) : (
                                                        results.map(
                                                            (result) => {
                                                                // Results tokens
                                                                if (
                                                                    !selected.some(
                                                                        (el) =>
                                                                            el.address ===
                                                                            result.address
                                                                    )
                                                                ) {
                                                                    return (
                                                                        <div
                                                                            className="cursor-pointer"
                                                                            key={`result-${result.address}`}
                                                                            onClick={() =>
                                                                                onClick(
                                                                                    result
                                                                                )
                                                                            }
                                                                        >
                                                                            <TokenDisplay
                                                                                data={
                                                                                    result
                                                                                }
                                                                                clickable={
                                                                                    false
                                                                                }
                                                                                active={
                                                                                    false
                                                                                }
                                                                                hoverable={true}
                                                                            />
                                                                        </div>
                                                                    )
                                                                }
                                                            }
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </form>
            {isCustomTokenView ? (
                <CustomToken customTokenAddress={tokenAddress} />
            ) : ( 
                <>
                    <hr className="border-0.5 border-gray-200 w-full" />

                    {/* FOOTER */}
                    <PopupFooter>
                        <ButtonWithLoading
                            label="Next"
                            formId="search-form"
                            disabled={selected.length === 0}
                            type="submit"
                        />
                    </PopupFooter>
                </>
                )
            }
  </>
)}

const CustomToken = (props: any) => {
    const history = useOnMountHistory()
    const { customTokenAddress } = props
    const {
        register,
        handleSubmit,
        errors,
        setError,
    } = useForm<customTokenFormData>({
        resolver: yupResolver(customTokenSchema),
    })

    const [isFirstIteration, setIsFirstIteration] = useState<boolean>(true)
    const [isCustomTokenEmpty, setIsCustomTokenEmpty] = useState<boolean>(false)
    const [result, setResult] = useState<TokenResponse>({
        address: "",
        decimals: undefined,
        logo: "",
        name: "",
        symbol: "",
        type: "",
    })
    const [message, setMessage] = useState<string>("")

    useEffect(() => {
        setResult((prevState) => ({
            ...prevState,
            address: customTokenAddress,
        }))
    }, [])

    const onSubmit = handleSubmit(async (data: customTokenFormData) => {
        try {
            // Valid form data
            if (
                data.tokenAddress.length !== 42 ||
                data.tokenAddress.substring(0, 2) !== "0x"
            ) {
                return setMessage("Enter a valid address.")
            }

            if (
                !/^[a-zA-Z0-9_.-]*$/.test(data.tokenSymbol) ||
                data.tokenSymbol === ""
            ) {
                return setMessage("Enter valid symbol.")
            }

            if (!data.tokenDecimals || isNaN(parseInt(data.tokenDecimals))) {
                return setMessage("Enter valid decimals.")
            }

            const newToken = {
              address: data.tokenAddress,
              decimals: data.tokenDecimals,
              logo: "",
              name: data.tokenSymbol,
              symbol: data.tokenSymbol,
              type: "",
            }
            const tokenToAdd = result.symbol? result : newToken;

            // populate symbol logo for custom token
            searchTokenInAssetsList(tokenToAdd.symbol.toUpperCase()).then(
              res => {
                const exactMatch = res.filter(
                  (r) => r.symbol.toLowerCase() === tokenToAdd.symbol.toLowerCase()
                )[0];

                tokenToAdd.logo = exactMatch ? exactMatch.logo : '';

                history.push({
                  pathname: '/settings/tokens/add/confirm',
                  state: { tokens: [tokenToAdd] }
                });
              } 
            ) 
        } catch (event) {
            // Invalid form data
            setError("form", event.toString())
        }
    })

    const onAddressChange = (value: string) => {
        console.log("onAddressChange", value)
        if (utils.isAddress(value)) {
            setIsCustomTokenEmpty(false)
            searchTokenInAssetsList(value)
                .then((res) => {
                    if (res && res.length) {
                        setResult((prevState) => ({
                            ...prevState,
                            ...res[0],
                        }))
                    }
                })
                .catch((err) => console.log("ERR: ", err))
        } else {
            setIsCustomTokenEmpty(true)
            setResult({
                address: "",
                decimals: undefined,
                logo: "",
                name: "",
                symbol: "",
                type: "",
            })
        }
    }

    const onSymbolChange = (value: string) => {
      updateResultField('symbol', value)
      updateResultField('name', value.toUpperCase())
    }

    const onDecimalsChange = (value: number) => updateResultField('decimals', value)

    const updateResultField = (field: string, value: string | number) => {
      setResult((prevState) => ({
        ...prevState,
        [field]: value
      }))
    }

    if (isFirstIteration && customTokenAddress) {
        onAddressChange(customTokenAddress)
        setIsFirstIteration(false)
    }

    return (
        <>
            {/* Custom token form */}
            <form
                className="flex flex-col justify-between h-full"
                onSubmit={onSubmit}
            >
                <div className="text-base font-bold text-black w-full text-center px-6">
                    Custom Token
                </div>
                <div className="h-full">
                    {/* ADDRESS */}
                    <div className="flex flex-col flex-1 p-6 pb-0 space-y-1">
                        <TextInput
                            appearance="outline"
                            label="Token Contract Address"
                            placeholder="Address"
                            name="tokenAddress"
                            register={register}
                            error={errors.tokenAddress?.message}
                            autoFocus={true}
                            maxLength={42}
                            defaultValue={result.address}
                            onChange={(e) => onAddressChange(e.target.value)}
                            readOnly={true}
                        />
                    </div>

                    {/* SYMBOL */}
                    <div className="flex flex-col flex-1 p-6 pb-0 space-y-1">
                        <TextInput
                            appearance="outline"
                            label="Token Symbol"
                            placeholder={result.symbol ? result.symbol : "ETH"}
                            defaultValue={result.symbol}
                            name="tokenSymbol"
                            register={register}
                            error={errors.tokenSymbol?.message}
                            onChange={(e) => onSymbolChange(e.target.value)}
                        />
                    </div>

                    {/* DECIMALS */}
                    <div className="flex flex-col flex-1 p-6 pb-0 space-y-1">
                        <TextInput
                            appearance="outline"
                            label="Decimals of Precision"
                            placeholder={
                                result.decimals
                                    ? result.decimals.toString()
                                    : "18"
                            }
                            defaultValue={
                                result.decimals ? result.decimals : ""
                            }
                            name="tokenDecimals"
                            register={register}
                            error={errors.tokenDecimals?.message}
                            onChange={(e) => onDecimalsChange(e.target.value)}
                        />
                    </div>

                    {/* ERROR */}
                    <div
                        className={`text-xs px-6 text-red-500 ${
                            message === "" ? "pt-0 h-0" : "pt-2"
                        }`}
                    >
                        {message || <>&nbsp;</>}
                    </div>
                </div>
            <hr className="border-0.5 border-gray-200 w-full" />

            {/* FOOTER */}
            <PopupFooter>
                <ButtonWithLoading
                    type="submit"
                    label="Next"
                    disabled={isCustomTokenEmpty}
                />
            </PopupFooter>
        </form>
      </>
    )
}

export default AddTokensPage
