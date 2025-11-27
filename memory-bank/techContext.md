# Technical Context: Paylo MCP Server

## 1. Technologies Used

- **Language:** TypeScript (compiled to JavaScript)
- **Runtime:** Node.js
- **Core Framework:** `@modelcontextprotocol/sdk`
- **Database Client:** `@supabase/supabase-js`
- **Validation:** `zod`
- **Environment Variables:** `dotenv` library for loading `.env` files.
- **Build System:** `tsc` (TypeScript Compiler).
- **Package Manager:** `npm`.

## 2. Development Setup

- **Prerequisites:** Node.js, npm.
- **Installation:** `npm install`
- **Configuration:** Requires a `.env` file with Supabase credentials (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). An `.env.example` file exists.
- **Building:** `npm run build` (compiles TypeScript to JavaScript in `build/` directory).
- **Running:** `node build/index.js`.

## 3. Technical Constraints

- Operates in a non-interactive environment (Stdio transport).
- Relies on environment variables for sensitive credentials.
- Must adhere to the MCP specification for communication.
- Dependent on the availability of the Supabase instance.

## 4. Key Dependencies

- `@modelcontextprotocol/sdk`: Core MCP functionality.
- `@supabase/supabase-js`: Client for interacting with the Paylo database.
- `zod`: Schema validation for tool inputs.
- `dotenv`: Environment variable loading.
- `typescript`: Language support.
