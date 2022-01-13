module.exports = {
    purge: ["./src/**/*.tsx", "./src/styles/classes.ts"],
    theme: {
        extend: {
            colors: {
                primary: {
                    100: "#E7F1FB",
                    200: "#D9E9FA",
                    300: "#1673FF",
                },
                gray: {
                    900: "#0A121E",
                },
            },
            borderRadius: {
                sm: "4px",
            },
            keyframes: {
                "privacy-rotate": {
                    "0%": { transform: "rotateX(0deg)" },
                    "100%": { transform: "rotateX(360deg)" },
                },
            },
            animation: {
                "privacy-rotate": "privacy-rotate 0.5s ease-in-out",
            },
            transitionProperty: {
                "width": "width"
            },
            fontSize: {
                'xxs': '.625rem'
            },
        },
    },
    variants: {
        extend: {
            visibility: ["group-hover"],
            scale: ["active"],
            backgroundColor: ["active"],
            fontWeight: ["hover"],
            animation: ["group-hover"],
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        // ...
    ],
}
