import client from "./client";

export interface CaptchaChallenge {
  image: string;
  token: string;
}

export function fetchCaptcha() {
  return client.get<CaptchaChallenge>("/captcha");
}
