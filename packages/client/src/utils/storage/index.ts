export const getSessionToken = (): string | null => {
  return sessionStorage.getItem("sessionToken");
};

export const storeSessionToken = (sessionToken: string) => {
  sessionStorage.setItem("sessionToken", sessionToken);
};
