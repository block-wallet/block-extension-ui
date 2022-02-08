import React, { useState } from "react"

import { Classes, classnames } from "../../styles/classes"

import PageLayout from "../../components/PageLayout"
import Divider from "../../components/Divider"
import LinkButton from "../../components/button/LinkButton"
import Spinner from "../../components/Spinner"
import PasswordInput from "../../components/input/PasswordInput"

import * as yup from "yup"
import { InferType } from "yup"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { isValidMnemonic } from "ethers/lib/utils"

import { importWallet } from "../../context/commActions"
import { useOnMountHistory } from "../../context/hooks/useOnMount"

import log from "loglevel"

const schema = yup.object().shape({
    seedPhrase: yup
        .string()
        .required("No seed provided.")
        .test(
            "is-correct",
            "Seed phrase must contain the correct format",
            (value) => {
                return isValidMnemonic(value!)
            }
        ),
    password: yup
        .string()
        .required("No password provided.")
        .min(8, "Password should be at least 8 characters long.")
        .matches(
            /(?=.*\d)(?=.*[a-z])/,
            "Password must contain at least one lowercase character and one digit."
        ),
    passwordConfirmation: yup
        .string()
        .required("Required")
        .oneOf([yup.ref("password"), null], "Passwords must match."),
    acceptTOU: yup
        .bool()
        .required("You must accept the Terms of Use.")
        .oneOf([true], "You must accept the Terms of Use."),
})
type SeedImportFormData = InferType<typeof schema>

const SeedImportPage = () => {
    const [showSeedPhrase, setShowSeedPhrase] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [passwordScore, setPasswordScore] = useState<number>(0)

    const history: any = useOnMountHistory()
    const {
        register,
        handleSubmit,
        setError,
        errors,
    } = useForm<SeedImportFormData>({
        resolver: yupResolver(schema),
    })
    const onSubmit = handleSubmit(async (data: SeedImportFormData) => {
        if (passwordScore < 3) {
            return setError("password", {
                message: "Password is not strong enough",
                shouldFocus: true,
            })
        }

        setIsLoading(true)
        const { password, seedPhrase } = data

        try {
            const result = await importWallet(password, seedPhrase)

            if (result) {
                history.push({ pathname: "/setup/done" })
            } else {
                throw new Error("Importing wallet failed.")
            }
        } catch (error) {
            log.error(error.message || error)

            setError("seedPhrase", {
                message: "Error importing seed phrase",
                shouldFocus: true,
            })
        }

        setIsLoading(false)
    })

    return (
        <PageLayout header maxWidth="max-w-lg">
            <span className="my-6 text-lg font-bold font-title">
                Import an Account
            </span>
            <Divider />
            <div className="flex flex-col p-6 space-y-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col px-6 my-2 space-y-1">
                        <span className="text-sm leading-relaxed text-center text-gray-600">
                            Enter your 12 word seed phrase to import your
                            account.
                        </span>
                    </div>
                    <div className="w-full px-4 py-4 text-sm text-center text-red-500 bg-red-100 rounded">
                        <strong className="font-bold">Warning: </strong>
                        <span>
                            Never disclose your seed phrase. Anyone asking for
                            your seed phrase is most likely trying to steal your
                            funds.
                        </span>
                    </div>
                </div>
            </div>
            <form
                className="flex flex-col w-full text-gray-600"
                onSubmit={onSubmit}
            >
                <div className="flex flex-col px-6 space-y-4">
                    <div className="flex flex-col space-y-2">
                        <div className="flex flex-col space-y-1">
                            <label
                                htmlFor="password"
                                className={Classes.inputLabel}
                            >
                                Seed Phrase
                            </label>
                            <input
                                name="seedPhrase"
                                type={showSeedPhrase ? "text" : "password"}
                                ref={register}
                                placeholder="Enter Seed Phrase"
                                className={Classes.input}
                            />
                            <span className="text-xs text-red-500">
                                {errors.seedPhrase?.message || <>&nbsp;</>}
                            </span>
                        </div>
                        <div className="flex flex-row items-center space-x-2">
                            <input
                                type="checkbox"
                                className={Classes.checkbox}
                                defaultChecked={showSeedPhrase}
                                onChange={() =>
                                    setShowSeedPhrase(!showSeedPhrase)
                                }
                            />
                            <span className="text-xs">Show seed phrase</span>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <PasswordInput
                            label="New Password"
                            placeholder="Enter New Password"
                            register={register}
                            error={errors.password?.message}
                            strengthBar={true}
                            setPasswordScore={setPasswordScore}
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Confirm New Password"
                            name="passwordConfirmation"
                            register={register}
                            error={errors.passwordConfirmation?.message}
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <div className="flex flex-row items-center space-x-2">
                            <input
                                type="checkbox"
                                className={Classes.checkbox}
                                name="acceptTOU"
                                id="acceptTOU"
                                ref={register}
                            />
                            <label htmlFor="acceptTOU" className="text-xs">
                                I have read and agree to the{" "}
                                <a
                                    href="https://www.blockwallet.io/terms-of-use-of-block-wallet.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-300"
                                >
                                    Terms of Use
                                </a>
                            </label>
                        </div>
                        <span className="text-xs text-red-500">
                            {errors.acceptTOU?.message || <>&nbsp;</>}
                        </span>
                    </div>
                </div>
                <Divider />
                <div className="flex flex-row p-6 space-x-4">
                    <LinkButton location="/setup/" text="Back" lite />
                    <button
                        type="submit"
                        className={classnames(
                            Classes.button,
                            "w-1/2 font-bold border-2 border-primary-300",
                            (errors.seedPhrase ||
                                errors.password ||
                                errors.passwordConfirmation ||
                                errors.acceptTOU ||
                                isLoading) &&
                                "opacity-50 pointer-events-none"
                        )}
                        disabled={
                            errors.seedPhrase ||
                            errors.password ||
                            errors.passwordConfirmation ||
                            errors.acceptTOU
                                ? true
                                : false
                        }
                    >
                        {!isLoading ? "Import" : <Spinner />}
                    </button>
                </div>
            </form>
        </PageLayout>
    )
}

export default SeedImportPage
