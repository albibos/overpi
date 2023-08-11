# overpi: overwatch api

## endpoints

### all heroes basic data

```https://overpi.albinus.gay/heroes```

returns an array of basic hero data for all heroes:

```json
[
  {
    "heroName": "Illari",
    "role": "support",
    "heroKey": "illari",
    "heroImage": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5ea986038f9d307bd4613d5e6f2c4c8e7f15f30ceeeabbdd7a06637a38f17e1f.png"
  },
  {
    "heroName": "Ana",
    "role": "support",
    "heroKey": "ana",
    "heroImage": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3429c394716364bbef802180e9763d04812757c205e1b4568bc321772096ed86.png"
  },
  ...
]
```
can be used with a query to sort heroes by role, like `/heroes/tank` or `/heroes/damage`

### specific hero data

```https://overpi.albinus.gay/hero?n=heroKey```

returns data for a specific hero (there is a lot of data, like data on all abilities and the complete story of the hero, so i have to shorten it):

```json
https://overpi.albinus.gay/hero?n=ana
{
  "name": "Ana",
  "description": "One of the founding members of Overwatch, Ana uses her skills and expertise to defend her home and the people she cares for.",
  "portrait": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3429c394716364bbef802180e9763d04812757c205e1b4568bc321772096ed86.png",
  "role": "support",
  "location": "Cairo, Egypt",
  "hitpoints": {
    "health": 200,
    "shields": 0,
    "armor": 0,
    "total": 200
  },
  ...
  ```

### player search

```https://overpi.albinus.gay/player/search?n=name```

returns an array of player profile data based on the query (currently uses overfast, gonna scrape the data myself soon!):
```json
https://overpi.albinus.gay/player/search?n=adventurer
{
  "total": 1900,
  "results": [
    {
      "player_id": "AdVentureR-2195",
      "name": "AdVentureR#2195",
      "privacy": "public",
      "career_url": "https://overfast-api.tekrop.fr/players/AdVentureR-2195"
    },
    {
      "player_id": "Adventurer-110149381",
      "name": "Adventurer#110149381",
      "privacy": "private",
      "career_url": "https://overfast-api.tekrop.fr/players/Adventurer-110149381"
    },
    {
      "player_id": "Adventurer-110229487",
      "name": "Adventurer#110229487",
      "privacy": "private",
      "career_url": "https://overfast-api.tekrop.fr/players/Adventurer-110229487"
    },
  ...
  ```

### player profile summary

  ```https://overpi.albinus.gay/player/summary?b=player-id```

  returns an array of a player profile summary:
  ```json
  https://overpi.albinus.gay/player/summary?b=AdVentureR-2195
  {
  "username": "AdVentureR",
  "avatar": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/21b9e01301442344ccf132814d3e07d3e5e84d55f7f36e5bdf53dea4a004e7f0.png",
  "namecard": null,
  "title": null,
  "endorsement": {
    "level": 3,
    "frame": "https://static.playoverwatch.com/img/pages/career/icons/endorsement/3-8ccb5f0aef.svg#icon"
  },
...
```

### hero patch notes

```https://overpi.albinus.gay/hero-updates```

returns an array of all hero patch notes:
```json
[
  {
    "heroName": "Illari",
    "devComment": "",
    "abilityUpdates": [
      {
        "abilityName": "Solar Rifle (Primary Fire)",
        "detailList": [
          "Long-range auto-charging rifle."
        ]
      },
      {
        "abilityName": "Solar Rifle (Secondary Fire)",
        "detailList": [
          "Medium-range healing beam that consumes solar energy."
        ]
      },
      {
        "abilityName": "Outburst (Ability 1)",
        "detailList": [
          "Launches you in the direction you are moving, knocking back enemies. Hold jump to go higher."
        ]
      },
      {
        "abilityName": "Healing Pylon (Ability 2)",
        "detailList": [
          "Deploy a pylon that heals allies."
        ]
      },
      {
        "abilityName": "Captive Sun (Ultimate)",
        "detailList": [
          "Fire an explosive ball of solar energy. Enemies hit are slowed and\nexplode after taking significant damage."
        ]
      }
    ]
  },
...
```

### bug fix patch notes

```https://overpi.albinus.gay/bug-fixes```

returns an array of all bug fix patch notes:
```json
[
  {
    "sectionTitle": "Lighting for Season 6",
    "updates": [
      {
        "p": "Push",
        "li": [
          "New Queen Street – Dawn",
          "Colosseo - Morning",
          "Esperança – Morning"
        ]
      },
      {
        "p": "Hybrid",
        "li": [
          "Blizzard World – Night (New)",
          "Eichenwalde – Morning",
          "Hollywood – Night",
          "King’s Row -- Night",
          "Midtown -- Morning",
          "Numbani -- Morning",
          "Paraíso -- Evening (New)"
        ]
      },
...
```

### overwatch screenshots

```https://overpi.albinus.gay/media/screenshots```

returns an array of screenshots of heroes and maps:
```json
{
  "Sojourn": [
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/bltd45cca5857c5cc5a/62298aebe47e3d2eff2101c6/sojourn_screenshot_02.png?auto=webp",
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/bltd0ac787a78dfa2f5/62298aeb04503350d255bce4/sojourn_screenshot_01.png?auto=webp"
  ],
  "Echo": [
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt806f229382fc0360/5e84e905297b4d1b5ff03813/echo-screenshot-005.jpg?auto=webp",
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/bltd4fa3fa40da5d0e3/5e84e9058d83401be1197494/echo-screenshot-004.jpg?auto=webp",
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt2f5482b9f5e67027/5e6fc2cf8d83401be1196c73/echo-screenshot-001.jpg?auto=webp",
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/bltc747346156082d56/5e6fc2cf8902221b5e1ddd8f/echo-screenshot-002.jpg?auto=webp",
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/bltd1e880b7590f9688/5e6fc2cf297b4d1b5ff03091/echo-screenshot-003.jpg?auto=webp"
  ],
...
```

### hero artworks

```https://overpi.albinus.gay/media/artworks```

returns an array of hero artworks and concept arts:
```json
{
  "Echo": [
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt31a6a0eefef5ee85/5e6fc267b6788f72b89e9c4c/echo-concept.jpg?auto=webp"
  ],
  "Sigma": [
    "https://images.blz-contentstack.com/v3/assets/blt2477dcaf4ebd440c/blt65e3918120aa6440/5d5ec75fa909ec1ccfcfa73c/sigma-concept.jpg?auto=webp"
  ],
 ...
```

### battlepass

```https://overpi.albinus.gay/battlepass```

returns an array of data for the free and premium battlepass:
```json
{
  "freeBattlePass": [
    "2 Epic skins",
    "2 Weapon Charms",
    "1 Highlight Intro",
    "2 Emotes",
    "4 Voice Lines ",
    "Prestige tier titles",
    "1500 Credits ",
    "Over 15+ additional rewards"
  ],
  "premiumBattlePass": [
    "Mythic A-7000 Wargod Ana Skin",
    "20% XP Battle Pass boost",
    "5 Legendary skins and 7 Epic skins",
    "2 Highlight Intros",
    "3 Weapon Charms",
    "3 Emotes",
    "5 Victory Poses",
    "10 Voice Lines",
    "500 additional credits",
    "Over 20+ additional rewards"
  ]
}
```

### a lot more coming soon just pumping as much out as possible right now

  
