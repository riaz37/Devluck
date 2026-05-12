const TOKEN_KEY = "devluck_token"

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  },

  set: (token: string) => {
    if (typeof window === "undefined") return
    localStorage.setItem(TOKEN_KEY, token)
  },

  remove: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(TOKEN_KEY)
  },
}

/* ---------------- DECODE TOKEN ---------------- */

export interface DecodedUser {
  id: string
  email: string
  role: "STUDENT" | "COMPANY"
  name: string | null
  image: string | null
}

export const decodeToken = (token: string): DecodedUser | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name ?? null,
      image: payload.image ?? null
    }
  } catch (err) {
    console.error("Invalid token:", err)
    return null
  }
}