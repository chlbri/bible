# Bible JSON Library (English & French Editions)

Full canonical Bible translations structured in hierarchical JSON format.

## JSON Hierarchy Specification

```json
{
  "version_id": "en_kjv",
  "version_name": "King James Version (KJV 1611/1769)",
  "language": "English",
  "source": "https://raw.githubusercontent.com/amir-hanna/bible/master/kjv.json",
  "testaments": {
    "Old Testament": {
      "Genesis": {
        "1": [
          "In the beginning God created the heaven and the earth.",
          "And the earth was without form, and void; and darkness was upon the face of the deep...",
          "..."
        ],
        "2": [
          "Thus the heavens and the earth were finished, and all the host of them.",
          "..."
        ]
      }
    },
    "New Testament": {
      "Matthew": {
        "1": [
          "The book of the generation of Jesus Christ, the son of David, the son of Abraham.",
          "..."
        ]
      }
    }
  }
}
```

## Available Translations

| ID | Version Name | Language | OT Books | NT Books | Total Books | Chapters | Total Verses | File Size | JSON File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `en_kjv` | King James Version (KJV 1611/1769) | English | 39 | 27 | 66 | 1189 | 31,102 | 4.41 MB | [`en_kjv.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/en_kjv.json) |
| `en_web` | World English Bible (WEB) | English | 39 | 27 | 66 | 1189 | 31,102 | 4.29 MB | [`en_web.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/en_web.json) |
| `en_ylt` | Young's Literal Translation (YLT 1898) | English | 39 | 27 | 66 | 1189 | 31,102 | 4.39 MB | [`en_ylt.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/en_ylt.json) |
| `en_bsb` | Berean Study Bible (BSB) | English | 39 | 27 | 66 | 1189 | 31,102 | 4.12 MB | [`en_bsb.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/en_bsb.json) |
| `en_bbe` | Bible in Basic English (BBE 1949/1964) | English | 39 | 27 | 66 | 1189 | 31,104 | 4.4 MB | [`en_bbe.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/en_bbe.json) |
| `en_asv` | American Standard Version (ASV 1901) | English | 39 | 27 | 66 | 1189 | 31,085 | 4.39 MB | [`en_asv.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/en_asv.json) |
| `fr_lsg` | Louis Segond 1910 (LSG) | French | 39 | 27 | 66 | 1189 | 31,102 | 4.44 MB | [`fr_lsg.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/fr_lsg.json) |
| `fr_mar` | Bible David Martin 1744 | French | 39 | 27 | 66 | 1189 | 31,103 | 4.74 MB | [`fr_mar.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/fr_mar.json) |
| `fr_ost` | Bible Ostervald 1996 | French | 39 | 27 | 66 | 1189 | 31,172 | 4.51 MB | [`fr_ost.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/fr_ost.json) |
| `fr_apee` | Bible de l'Épée (APEE) | French | 39 | 27 | 66 | 1189 | 30,975 | 4.51 MB | [`fr_apee.json`](file:///Users/bri/.gemini/antigravity/scratch/bible_library/json/fr_apee.json) |
