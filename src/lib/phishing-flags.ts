export const PHISHING_FLAGS: Record<string, string> = {
  no_https: "Немає HTTPS",
  brand_in_subdomain: "Відомий бренд не в основному домені",
  digits_hyphen_domain: "Дефіс і цифри в домені",
  rare_tld: "Рідкісний домен верхнього рівня",
  login_in_path: "Слово «login» у шляху",
  ip_host: "IP-адреса замість домену",
  many_subdomains: "Забагато піддоменів",
  long_url: "Надто довгий URL",
  at_symbol: "Символ «@» в адресі",
  suspicious_keyword: "Підозріле слово в адресі",
};

export function flagLabel(id: string): string {
  return PHISHING_FLAGS[id] ?? id;
}
