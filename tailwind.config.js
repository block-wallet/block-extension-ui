module.exports = {
    purge: ['./src/**/*.tsx', './src/styles/classes.ts'],
    theme: {
        extend: {
            colors: {
                primary: {
                    100: '#E7F1FB',
                    200: '#D9E9FA',
                    300: '#1673FF',
                },
                gray: {
                    900: '#0A121E',
                },
            },
            borderRadius: {
                sm: '4px',
            },
        },
    },
    variants: {
        extend: {
            visibility: ['group-hover'],
            scale: ['active'],
            backgroundColor: ['active'],
            fontWeight: ['hover'],
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        // ...
    ],
};
