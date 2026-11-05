# Map data

`ukraine-oblasts.json` — oblast-level (ADM1) boundaries of Ukraine, 27 features (24 oblasts, AR Crimea, Kyiv, Sevastopol).

- Source: geoBoundaries, `gbOpen/UKR/ADM1` (`geoBoundaries-UKR-ADM1_simplified.geojson`), https://www.geoboundaries.org — https://github.com/wmgeolab/geoBoundaries
- License: CC BY 4.0 (attribution: Runfola et al., geoBoundaries, 2020).
- Processing: `mapshaper -simplify 12% keep-shapes -filter-fields shapeName,shapeISO -o precision=0.001` (760 KB → 55 KB), then rings rewound to d3-geo order (exterior clockwise, holes counter-clockwise; RFC 7946 is the opposite and makes d3 fill the whole globe).
- `shapeName` is mapped to our region slugs by `GEO_NAME_TO_SLUG` in `src/lib/regions.ts`.
