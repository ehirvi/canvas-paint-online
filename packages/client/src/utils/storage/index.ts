export const getAccessToken = (): string | null => {
  return sessionStorage.getItem("accessToken");
};

export const setAccessToken = (accessToken: string) => {
  sessionStorage.setItem("accessToken", accessToken);
};
