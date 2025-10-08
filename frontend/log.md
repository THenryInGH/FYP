# 1. Setup frontend
- Setup with vite + typescript + swc
- setup tailwindcss

# 2. Setup navigation
- ReactDOM
- Link in Navbar
- Oslet in App

# 3. Vite server setup
- difference between localhost and 0.0.0.0
- by default, `npm run dev` hosts vite at this machine only (localhost), meaning accessible only inside the same host
- `npm run dev -- --host 0.0.0.0` host on all network interface, publicly accessible 

# 4. Update chat interface

# 5. Create `.env` to smooth ONOS API calling
- same level as package.json
- For vite, variables must start with `VITE_`, or they won't be exposed to the frontend
- gitignore this for security purpose

# 6. Create utils (utilities)
- where to keep small, reusable logic that isn't tied to specific page or component, like fetching APIs, formatting data, or handle time over conversions
- just like a toolbox
- CORS (Cross-Origin Resource Sharing): a mechanism that prevents frontend to request data directly from other domain
