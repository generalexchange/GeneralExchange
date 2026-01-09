# General Exchange - Interactive Trade Engine

A Decentralized trading platform enabling 24/7, non-custodial execution through.

## Rationale

Modern trading platforms are fragmented across custodians, market hours, asset classes, and interfaces. Retail users are often constrained by slow settlement,
limited access windows, opaque execution paths, and tooling that does not scale from casual investing to professional trading workflows.  General Exchange
addresses these issues by providing a unified, high-performance trading interface that supports both on-chain and traditional market execution while maintaining
non-custodial principles and continuous availability.


## Features

- **State-of-the-art Interface**: Experience a trading machine
- **Integrated News**: Business news from our in-house platform
- **On-Chain Execution**: Trades routed through Solana liquidity pools
- **Dashboard**: Investment portfolio tracker with charts and transaction history
- **Interactive Brokers Integration**: Connect with professional trading accounts

## Getting Started

Download & Install
Supported Platforms

macOS (Intel & Apple Silicon)

Windows 10+

Installation Instructions

Download the installer for your platform:

macOS Installer

Windows Installer

Run the installer and follow the on-screen instructions.

On macOS: Drag the app to your Applications folder

On Windows: Run the .exe and follow the wizard

Launch the application

macOS: Open from Applications or Launchpad

Windows: Open from Start Menu or Desktop shortcut

Get started trading

Sign in with your account or create a new one

Configure your portfolio dashboard and start exploring the platform

3. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (Homepage, Login, Dashboard)
├── types/         # TypeScript type definitions
├── data/          # Mock data for development
├── context/       # React Context providers
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Available Routes

- `/` - Homepage (Professional Trading Platform)
- `/login` - Login page
- `/dashboard` - Portfolio dashboard
- `/features` - Platform features
- `/pricing` - Subscription plans
- `/our-team` - Meet the team
- `/documentation` - User documentation
- `/help-center` - Support and FAQ
- `/community` - Trading community
- `/request-access` - Request platform access

## Mock Data

The application uses placeholder data stored in the `src/data/` directory. Replace this with API calls when integrating with Interactive Brokers and other trading APIs.

## Professional Trading Features

- **AI-Powered Risk Management**: Advanced algorithms for portfolio analysis
- **Real-time Market Data**: Live market analysis and alerts
- **Options Trading Tools**: Professional-grade options analysis
- **Interactive Brokers Integration**: Seamless connection to trading accounts
- **Risk Alerts**: Automated notifications for portfolio risks
- **Trade Optimization**: AI-suggested trade improvements

