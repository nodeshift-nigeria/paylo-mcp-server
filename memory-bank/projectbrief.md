# Project Brief: Paylo MCP Server

## 1. Project Goal

To create and maintain a Model Context Protocol (MCP) server that provides tools and resources for interacting with Paylo's services. This server allows AI assistants like Cline to programmatically access Paylo functionalities, enabling AI-driven commerce.

## 2. Core Requirements

The server must provide capabilities to:
- Discover Paylo merchants and storefronts.
- Search for products across multiple merchants.
- Retrieve detailed information about specific products.
- Create orders and generate payment links.
- Check payment status.

## 3. Target Users

AI assistants and developers integrating Paylo commerce services into automated workflows or conversational interfaces.

## 4. Scope

- **In Scope:** Implementing MCP tools for merchant discovery, product search, and order creation. Handling interactions with the Paylo database (Supabase).
- **Out of Scope:** User interface, direct payment processing (handled via generated links).

## 5. Key Technologies

- TypeScript
- Node.js
- `@modelcontextprotocol/sdk`
- Supabase (Database & Auth)
- `dotenv` for environment variable management
