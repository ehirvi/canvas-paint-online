export const getAccessToken = (): string | null => {
  return sessionStorage.getItem("accessToken");
};

export const storeAccessToken = (accessToken: string) => {
  sessionStorage.setItem("accessToken", accessToken);
};
