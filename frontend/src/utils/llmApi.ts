const LLM_API = import.meta.env.VITE_LLM_API;

// Differences between export and export default
// export default: only one per file, can be imported with name directly
// export: multiple per file, must be imported with the {} e.g. import { useState } from 'react';

// async function tell JS the function contains asynchronous operations (code takes time)
// e.g. fetching from an API, reading a file, waiting for user input


// export async function sendPrompt(prompt: string): Promise<string> {
//     try 
// }