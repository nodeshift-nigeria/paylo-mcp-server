# System Patterns: Paylo MCP Server

## 1. Architecture Overview

The server follows a modular structure, separating concerns into distinct directories:

```mermaid
graph TD
    A[index.ts] --> B(Handlers);
    B -- registers --> C(MCP Server Instance);
    B --> D(Services);
    D --> E(Supabase Client);
    E -- queries --> F(Paylo Database);
    B -- uses --> G(Schemas);
    A -- uses --> H(Utils/Logging);

    subgraph Core
        A
        C
    end

    subgraph Request Handling
        B
    end

    subgraph Business Logic & Data Access
        D
        E
    end

    subgraph Data & Configuration
        G
    end

    subgraph Utilities
        H
    end
```

## 2. Key Technical Decisions

- **MCP SDK:** Uses `@modelcontextprotocol/sdk` for core server implementation and communication.
- **Stdio Transport:** Leverages `StdioServerTransport` for communication.
- **Modular Handlers:** Request handling logic is separated into `handlers/resources.ts` and `handlers/tools.ts`.
- **Service Layer:** Business logic is encapsulated in `services/` (e.g., `merchants.ts`, `products.ts`), which interact with Supabase.
- **Supabase Integration:** Uses the Supabase JS client for all database operations.
- **Schema Definitions:** Input validation uses `zod` schemas defined inline or in `schemas/`.
