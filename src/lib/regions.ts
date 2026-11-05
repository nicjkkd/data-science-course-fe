// Region slugs shared with the backend (same dict lives in Python). Labels are Ukrainian.
export const REGIONS: Record<string, string> = {
  vinnytsia: "Вінницька",
  volyn: "Волинська",
  dnipro: "Дніпропетровська",
  donetsk: "Донецька",
  zhytomyr: "Житомирська",
  zakarpattia: "Закарпатська",
  zaporizhzhia: "Запорізька",
  ivano_frankivsk: "Івано-Франківська",
  kyiv: "Київська",
  kyiv_city: "м. Київ",
  kirovohrad: "Кіровоградська",
  luhansk: "Луганська",
  lviv: "Львівська",
  mykolaiv: "Миколаївська",
  odesa: "Одеська",
  poltava: "Полтавська",
  rivne: "Рівненська",
  sumy: "Сумська",
  ternopil: "Тернопільська",
  kharkiv: "Харківська",
  kherson: "Херсонська",
  khmelnytskyi: "Хмельницька",
  cherkasy: "Черкаська",
  chernivtsi: "Чернівецька",
  chernihiv: "Чернігівська",
  crimea: "АР Крим",
  sevastopol: "м. Севастополь",
};

// `shapeName` in public/geo/ukraine-oblasts.json (geoBoundaries ADM1) → region slug.
export const GEO_NAME_TO_SLUG: Record<string, string> = {
  "Vinnytsia Oblast": "vinnytsia",
  "Volyn Oblast": "volyn",
  "Dnipropetrovsk Oblast": "dnipro",
  "Donetsk Oblast": "donetsk",
  "Zhytomyr Oblast": "zhytomyr",
  "Zakarpattia Oblast": "zakarpattia",
  "Zaporizhia Oblast": "zaporizhzhia",
  "Ivano-Frankivsk Oblast": "ivano_frankivsk",
  "Kyiv Oblast": "kyiv",
  Kyiv: "kyiv_city",
  "Kirovohrad Oblast": "kirovohrad",
  "Luhansk Oblast": "luhansk",
  "Lviv Oblast": "lviv",
  "Mykolaiv Oblast": "mykolaiv",
  "Odessa Oblast": "odesa",
  "Poltava Oblast": "poltava",
  "Rivne Oblast": "rivne",
  "Sumy Oblast": "sumy",
  "Ternopil Oblast": "ternopil",
  "Kharkiv Oblast": "kharkiv",
  "Kherson Oblast": "kherson",
  "Khmelnytskyi Oblast": "khmelnytskyi",
  "Cherkasy Oblast": "cherkasy",
  "Chernivtsi Oblast": "chernivtsi",
  "Chernihiv Oblast": "chernihiv",
  "Autonomous Republic of Crimea": "crimea",
  Sevastopol: "sevastopol",
};

const LABEL_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(REGIONS).map(([slug, label]) => [label, slug]),
);

export function regionLabel(slug: string): string {
  return REGIONS[slug] ?? slug;
}

/** Heatmap cells carry the region's Ukrainian label; this maps it back to the slug. */
export function regionSlugFromLabel(label: string): string | undefined {
  return LABEL_TO_SLUG[label];
}
