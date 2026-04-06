export const EApiEndpoint = {
    SESSION_CREATE: "/session/create",
} as const

export type EApiEndpoint = typeof EApiEndpoint[keyof typeof EApiEndpoint]