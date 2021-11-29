import React, { FunctionComponent, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import PageLayout from "../../components/PageLayout"
import Divider from "../../components/Divider"
import Spinner from "../../components/Spinner"
import classnames from "classnames"
import { Classes } from "../../styles/classes"
import { verifySeedPhrase } from "../../context/commActions"
import { findPositionOfSelectedWord, shuffleArray } from "../../util"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupFooter from "../../components/popup/PopupFooter"

export interface SeedPhraseWord {
    word: string
    isSelected: boolean
}

const SeedWordsInput: FunctionComponent<{
    words: SeedPhraseWord[]
    value: SeedPhraseWord[]
    onChange: (words: SeedPhraseWord[]) => void
}> = ({ words, value, onChange }) => {
    const [availableWords, setAvailableWords] = useState([...words])

    const handleWordClick = (
        seedWord: SeedPhraseWord,
        wordIndex: number,
        isInputClick: boolean
    ) => {
        let newValue = [...value]
        let updatedAvailableWords = [...availableWords]

        if (isInputClick) {
            // remove the word from the input
            newValue.splice(wordIndex, 1)
            const wordIndexInWords = findPositionOfSelectedWord(
                updatedAvailableWords,
                seedWord
            )
            updatedAvailableWords[wordIndexInWords].isSelected = false
        } else {
            if (seedWord.isSelected) {
                // find the word in the input and remove it
                const wordIndexInInput = findPositionOfSelectedWord(
                    newValue,
                    seedWord
                )
                newValue.splice(
                    wordIndexInInput,
                    wordIndexInInput !== -1 ? 1 : 0
                )
            } else {
                newValue = [...value, { word: seedWord.word, isSelected: true }]
            }
            updatedAvailableWords[wordIndex].isSelected = !seedWord.isSelected
        }
        setAvailableWords(updatedAvailableWords)
        onChange(newValue)
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="p-2 border border-primary-100 rounded-md grid grid-cols-4 grid-rows-3 gap-2 h-36">
                {value.map((wordObj, index) => (
                    <button
                        type="button"
                        key={`${wordObj.word}_${index}`}
                        className="bg-gray-900 text-white rounded-md py-2"
                        style={{ height: "fit-content" }}
                        onClick={() => handleWordClick(wordObj, index, true)}
                    >
                        {wordObj.word}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
                {availableWords.map((wordObj, index) => (
                    <button
                        type="button"
                        key={`${wordObj.word}_${index}`}
                        className={classnames(
                            "rounded-md py-3 border",
                            wordObj.isSelected
                                ? "border-transparent bg-gray-900 text-white"
                                : "border-primary-100 text-gray-900"
                        )}
                        onClick={() => {
                            return handleWordClick(wordObj, index, false)
                        }}
                    >
                        {wordObj.word}
                    </button>
                ))}
            </div>
        </div>
    )
}

const BackupConfirmPage = () => {
    const history: any = useOnMountHistory()
    const { seedPhrase, isReminder, password } = history.location.state
    const backLink = isReminder ? "/reminder" : "/setup/create/notice"
    const doneLink = isReminder ? "/reminder/backup/done" : "/setup/done"
    const [inputWords, setInputWords] = useState<SeedPhraseWord[]>([])
    const [
        isVerificationInProgress,
        setIsVerificationInProgress,
    ] = useState<boolean>(false)
    const [verificationError, setVerificationError] = useState<string>("")
    const seedWords = useMemo(() => {
        let wordsForSeedPhrase: SeedPhraseWord[] = []
        const words = seedPhrase.split(" ")
        shuffleArray(words)
        wordsForSeedPhrase = []
        words.forEach((word: string) => {
            wordsForSeedPhrase.push({
                word,
                isSelected: false,
            })
        })
        return wordsForSeedPhrase
    }, [seedPhrase])

    const isPhraseValid = () => {
        let inputPhrase: string[] = []
        inputWords.forEach((wordObj) => {
            inputPhrase.push(wordObj.word)
        }, "")
        return seedPhrase === inputPhrase.join(" ")
    }

    const confirmSeedPhrase = async () => {
        setIsVerificationInProgress(true)
        try {
            const isSeedPhraseVerified = await verifySeedPhrase(
                seedPhrase,
                password
            )
            if (isSeedPhraseVerified) {
                setVerificationError("")
                setIsVerificationInProgress(false)
                history.push({ pathname: doneLink })
            } else {
                setVerificationError("Verification failed")
            }
        } catch {
            setVerificationError("Error verificating the seed phrase")
        }
        setIsVerificationInProgress(false)
    }

    return (
        <PageLayout
            screen={isReminder}
            header={!isReminder}
            maxWidth={isReminder ? "" : "max-w-md"}
            className={classnames(
                "text-center",
                isReminder ? "max-h-screen" : ""
            )}
        >
            {isReminder ? (
                <div className="w-full">
                    <PopupHeader
                        title="Confirm Seed Phrase"
                        keepState
                        close={false}
                    />
                </div>
            ) : (
                <>
                    <span
                        className={classnames(
                            "font-bold my-6 font-title",
                            isReminder ? "text-base" : "text-lg "
                        )}
                    >
                        Confirm Seed Phrase
                    </span>
                </>
            )}
            <Divider />
            <div
                className={classnames(
                    "flex flex-col text-gray-600 text-sm ",
                    isReminder ? "space-y-6 p-4" : "space-y-8 p-8"
                )}
            >
                <span>
                    Make sure that you've got it right - type out your phrase by
                    selecting the words below in the correct order.
                </span>

                <span
                    className={classnames(
                        "text-red-500 text-xs",
                        verificationError ? "" : "hidden"
                    )}
                >
                    {verificationError || <>&nbsp;</>}
                </span>
                <SeedWordsInput
                    words={seedWords}
                    value={inputWords}
                    onChange={(words) => setInputWords(words)}
                />
            </div>
            <Divider />

            {isReminder ? (
                <PopupFooter>
                    <ButtonWithLoading
                        label="Confirm"
                        isLoading={isVerificationInProgress}
                        onClick={confirmSeedPhrase}
                    />
                </PopupFooter>
            ) : (
                <>
                    <div
                        className={classnames(
                            "flex flex-row space-x-4 w-full",
                            isReminder ? "p-5" : "p-6"
                        )}
                    ></div>
                    <div className="flex flex-row p-6 space-x-4">
                        <Link
                            to={{
                                pathname: backLink,
                                state: { seedPhrase, password },
                            }}
                            className={Classes.liteButton}
                        >
                            Back
                        </Link>
                        <button
                            type="button"
                            className={classnames(
                                Classes.button,
                                "font-bold border-2 border-primary-300",
                                (!isPhraseValid() ||
                                    isVerificationInProgress) &&
                                    "opacity-50 pointer-events-none"
                            )}
                            onClick={confirmSeedPhrase}
                        >
                            {!isVerificationInProgress ? (
                                "Confirm"
                            ) : (
                                <Spinner />
                            )}
                        </button>
                    </div>
                </>
            )}
        </PageLayout>
    )
}

export default BackupConfirmPage
