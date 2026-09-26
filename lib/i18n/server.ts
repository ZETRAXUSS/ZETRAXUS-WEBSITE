import { cookies, headers } from "next/headers";
import { LANG_COOKIE, isLang, langFromAcceptHeader, type Lang } from "./config";
import { createTranslator } from "./translate";

/** Resolve the visitor's language on the server (cookie first, then browser). */
export async function getServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LANG_COOKIE)?.value;
  if (isLang(fromCookie)) return fromCookie;

  const headerStore = await headers();
  return langFromAcceptHeader(headerStore.get("accept-language"));
}

export async function getServerT() {
  const lang = await getServerLang();
  return { lang, t: createTranslator(lang) };
}
