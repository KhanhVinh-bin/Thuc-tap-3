export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body || {}

    // Fake credentials
    const VALID_EMAIL = "admin@gmail.com"
    const VALID_PASSWORD = "123456"

    await new Promise((r) => setTimeout(r, 600))

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      return new Response(
        JSON.stringify({ success: true, message: "Login success", token: "fake-token-abc" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: "Sai email hoặc mật khẩu" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}