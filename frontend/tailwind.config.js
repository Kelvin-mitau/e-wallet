/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specify the files where Tailwind CSS should look for classes.
  // This is crucial for Tailwind to purge unused CSS and keep your bundle small.
  content: [
    "./index.html", // For a basic HTML file
    "./src/**/*.{js,jsx,ts,tsx}", // For React/Vue/Angular projects (adjust as needed)
    // Add other file types or paths if you have them, e.g.,
    // "./public/**/*.html",
  ],
  theme: {
    // Extend Tailwind's default theme.
    // You can add custom colors, fonts, spacing, breakpoints, etc.
    extend: {
      // Example: Adding custom colors
      colors: {
        'custom-blue': '#243c5a',
        'custom-purple': '#7e5bef',
      },
      // Example: Adding custom font families
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Using Inter as a default, you can add others
        serif: ['Merriweather', 'serif'],
      },
      // Example: Adding custom spacing values
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      // Example: Custom breakpoints (if needed)
      screens: {
        'xs': '480px',
      },
    },
  },
  // Configure Tailwind plugins.
  // You can add official plugins like @tailwindcss/forms, @tailwindcss/typography, etc.
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};
