/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'custom-green': '#3e5a33',
                'dark-green': '#2e4726'
            }
        },
    },
    plugins: [],
}
