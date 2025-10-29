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

# 7. Integration with ONOS

# 8. CORS (Cross-Origin Resource Sharing)
- browser security feature that prevents a web app (running on one origin) from requesting data from another origin unless that server explicitly allows it.
- Happened when frontend is access using localhost from vscode remote access extension, so browser will see that the frontend is running locally but ONOS is on remote access server
- Tried to solve it using Nginx while onbroading the frontend to [domain](http://henryfyp.my)


# 9. Hooks and utils

# 10. Interface in javascript
- 
