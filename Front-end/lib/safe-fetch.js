// lib/safe-fetch.js
export async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options)
    // always read text first
    const text = await res.text()

    // try parse JSON only if text looks like JSON
    let data = null
    if (text !== null && text !== undefined && text.trim() !== "") {
      try {
        data = JSON.parse(text)
      } catch (parseErr) {
        // not JSON; keep raw text
        data = text
      }
    }

    return { ok: res.ok, status: res.status, data, rawText: text }
  } catch (networkErr) {
    // network error (server down, CORS, invalid url, etc)
    return { ok: false, status: 0, data: null, rawText: null, error: networkErr }
  }
}
