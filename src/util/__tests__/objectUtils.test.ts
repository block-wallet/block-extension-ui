import { deepEqual } from "../objectUtils"
describe("object utils tests", () => {
    describe("object utils tests", () => {
        test("should retrun that object with different properties are not equal", () => {
            expect(
                deepEqual(
                    {
                        a: 1,
                    },
                    {
                        b: 2,
                    }
                )
            ).toBeFalsy()
        })
        test("should retrun that object with same properties are not equal", () => {
            expect(
                deepEqual(
                    {
                        a: 1,
                    },
                    {
                        a: 2,
                    }
                )
            ).toBeFalsy()
        })
        test("should retrun that object with nested properties are not equal", () => {
            expect(
                deepEqual(
                    {
                        a: 1,
                        b: {
                            c: 1,
                        },
                    },
                    {
                        a: 1,
                        b: {
                            c: 2,
                        },
                    }
                )
            ).toBeFalsy()
        })
        test("should retrun that object with same properties are equal", () => {
            expect(
                deepEqual(
                    {
                        a: 1,
                    },
                    {
                        a: 1,
                    }
                )
            ).toBeTruthy()
        })
        test("should retrun that object with same nested properties are equal", () => {
            expect(
                deepEqual(
                    {
                        a: 1,
                        b: {
                            c: 1,
                        },
                    },
                    {
                        a: 1,
                        b: {
                            c: 1,
                        },
                    }
                )
            ).toBeTruthy()
        })
    })
})
