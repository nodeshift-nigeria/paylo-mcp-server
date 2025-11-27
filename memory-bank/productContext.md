# Product Context: Paylo MCP Server

## 1. Problem Solved

AI assistants and automated systems lack a standardized way to interact with Paylo's commerce platform (searching products, discovering merchants, creating orders). This server bridges that gap, enabling programmatic access to Paylo's offerings for AI-driven shopping experiences.

## 2. How It Works

The server exposes specific functionalities of the Paylo platform through the Model Context Protocol (MCP). Clients (like AI assistants) can call defined MCP tools (e.g., `list_merchants`, `search_products`, `create_order`) with appropriate parameters. The server translates these calls into Supabase database queries and business logic, processes the responses, and returns the results in a structured format suitable for the client.

## 3. User Experience Goals

- **Discoverability:** Tools and resources should be clearly named and described so AI agents know how to use them.
- **Reliability:** The server should handle database interactions robustly, including error handling.
- **Simplicity:** Input schemas for tools should be straightforward and easy to use.
- **Efficiency:** Provide necessary information (product details, payment links) without overwhelming the client.
