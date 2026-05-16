# System Patterns

## Architecture

The project follows a component-based architecture using React. It is a browser extension, so it has a background script and content scripts that interact with the browser.

## Key Technical Decisions

- **UI Framework:** React with TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

## Component Relationships

- The main application component is `App.tsx`.
- The UI is divided into several components, including sections for configuration, inspiration, and strategy.
- Views like `AuthView`, `CropView`, `PaywallView`, and `SettingsView` handle different application states.