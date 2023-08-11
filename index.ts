import express from 'express';
import Overwatch from 'overfast-api-client';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.get('/api/heroes/:query?', async (req, res) => {
  try {
    const url = 'https://overwatch.blizzard.com/en-us/heroes/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const query = req.params.query;

    const heroCards = $('.heroCard');

    const heroes = heroCards.map((index, card) => {
      const role = $(card).attr('data-role');
      const heroName = $(card).attr('hero-name');
      const heroKey = $(card).attr('data-hero-id');
      const heroImage = $(card).find('.heroCardPortrait').attr('src');

      if (!query || role === query) {
        return {
          heroName,
          role,
          heroKey,
          heroImage,
        };
      }
      return null;
    }).get();

    res.json(heroes.filter(hero => hero !== null));
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping hero information.' });
  }
});

app.get('/api/hero', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Hero name is required' });
  }

  try {
    const hero = await Overwatch.hero(name.toString()).catch(() => null);

    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }

    res.json(hero);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching hero' });
  }
});

app.get('/api/search-players', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Player name is required' });
  }

  try {
    const playerSearchResult = await Overwatch.searchPlayers({ name: name.toString() });
    res.json(playerSearchResult);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while searching for players' });
  }
});

app.get('/player-summary', async (req, res) => {
  const { battletag } = req.query;

  if (!battletag) {
    return res.status(400).json({ error: 'Battletag is required' });
  }

  try {
    const playerSummary = await Overwatch.player(battletag.toString()).summary;
    res.json(playerSummary);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching player summary' });
  }
});

app.get('/api/hero-updates', async (req, res) => {
  try {
    const url = 'https://overwatch.blizzard.com/en-us/news/patch-notes/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const patchNotes: any[] = [];

    $('.PatchNotesHeroUpdate').each((index, element) => {
      const heroName = $(element).find('.PatchNotesHeroUpdate-name').text();
      const devComment = $(element).find('.PatchNotesHeroUpdate-dev p').text();
      const abilityUpdates: any[] = [];

      $(element).find('.PatchNotesAbilityUpdate').each((index, abilityElement) => {
        const abilityName = $(abilityElement).find('.PatchNotesAbilityUpdate-name').text();
        const detailList: string[] = [];

        $(abilityElement)
          .find('.PatchNotesAbilityUpdate-detailList ul li')
          .each((index, detailElement) => {
            detailList.push($(detailElement).text());
          });

        abilityUpdates.push({ abilityName, detailList });
      });

      patchNotes.push({ heroName, devComment, abilityUpdates });
    });

    res.json(patchNotes);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
});

app.get('/api/bug-fixes', async (req, res) => {
  try {
    const url = 'https://overwatch.blizzard.com/en-us/news/patch-notes/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const bugFixes: any[] = [];

    $('.PatchNotesGeneralUpdate').each((index, element) => {
      const sectionTitle = $(element).find('.PatchNotesGeneralUpdate-title').text();
      const updates: any[] = [];

      const paragraphs = $(element).find('p');
      paragraphs.each((index, paragraph) => {
        const pText = $(paragraph).text();
        const relatedLiElements = $(paragraph).nextUntil('p').filter('ul').find('li');
        const liUpdates: string[] = [];

        relatedLiElements.each((index, liElement) => {
          const liText = $(liElement).text();
          liUpdates.push(liText);
        });

        if (liUpdates.length > 0) {
          updates.push({ p: pText, li: liUpdates });
        }
      });

      if (updates.length > 0) {
        bugFixes.push({ sectionTitle, updates });
      }
    });

    res.json(bugFixes);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping bug fixes data.' });
  }
});

app.get('/api/ow-media', async (req, res) => {
  try {
    const response = await axios.get('https://overwatch.blizzard.com/en-us/media/screenshots/');
    const html = response.data;
    const $ = cheerio.load(html);

    const scrapedData: { [title: string]: string[] } = {};

    $('.MediaItem a[data-glightbox]').each((index, element) => {
      const title = $(element).attr('data-glightbox').split('title: ')[1];
      const imgUrl = $(element).attr('href');

      if (title && imgUrl) {
        if (!scrapedData[title]) {
          scrapedData[title] = [];
        }
        scrapedData[title].push(imgUrl);
      }
    });

    res.json(scrapedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while scraping the data.');
  }
});

app.get('/api/battlepass', async (req, res) => {
  try {
    const url = 'https://overwatch.blizzard.com/en-us/season/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const freeBattlePassItems = $('blz-card[blz-modal-trigger="platform-selection-1"] div[slot="description"] li');
    const freeBattlePass = freeBattlePassItems.map((index, item) => $(item).text()).get();

    const premiumBattlePassItems = $('blz-card[blz-modal-trigger="battle-pass-modal-1"] div[slot="description"] li');
    const premiumBattlePass = premiumBattlePassItems.map((index, item) => $(item).text()).get();

    const seasonHeader = {
      heading: $('blz-header[slot="header"] h1').text()
    };

    const seasonData = {
      seasonHeader,
      freeBattlePass,
      premiumBattlePass,
    };

    res.json(seasonData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping season info.' });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blogId = req.params.id;
    const url = `https://overwatch.blizzard.com/en-us/news/${blogId}/`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const blogTitle = $('.blog-details .blog-title').text();
    const authorName = $('.blog-details .author-name').text();
    const publishDate = $('.blog-details .publish-date').text();
    const blogImage = $('.blog-details .blog-header-image img').attr('src');
    const blogContent = $('.blog-details .blog-detail').text();

    const blogDetails = {
      blogTitle,
      authorName,
      publishDate,
      blogImage,
      blogContent,
    };

    res.json(blogDetails);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping blog details.' });
  }
});

app.get('/api/highlights', async (req, res) => {
  try {
    const url = 'https://overwatch.blizzard.com/en-us/season/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const highlightCards = $('blz-card[variant="simple-large"]');

    const highlights = highlightCards.map((index, card) => {
      const imageSrc = $(card).find('blz-image').attr('src');
      const availability = $(card).find('h5[slot="subheading"]').text();
      const heading = $(card).find('h4[slot="heading"]').text();
      const description = $(card).find('div[slot="description"] > p').text();

      return {
        imageSrc,
        availability,
        heading,
        description,
      };
    }).get();

    res.json(highlights);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping highlights' });
  }
});

// soon!!!!

app.get('/api/shop', async (req, res) => {
  try {
    const url = 'https://us.shop.battle.net/en-us/family/overwatch';
    const response = await axios.get(url);
    const html = response.data;
    
    const shopItems: ShopItem[] = []; 
    
    const $ = cheerio.load(html);
    $('.browsing-card').each((index, element) => {
      const image = $(element).find('img').attr('src');
      const highlight = $(element).find('.meka-browsing-card__details__highlight').text();
      const header = $(element).find('h3').text();
      const price = $(element).find('.price').text();

      shopItems.push({ image, highlight, header, price });
    });

    res.json({ shopItems });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping shop data' });
  }
});

app.get('/forums/top', async (req, res) => {
  try {
    const url = 'https://us.forums.blizzard.com/en/overwatch/top';
    const response = await axios.get(url);
    const html = response.data;

    const forumPosts = [];

    const $ = cheerio.load(html);
    const topicRows = $('.topic-list-item');
    
    topicRows.each((index, element) => {
      const topicId = $(element).attr('data-topic-id');
      const title = $(element).find('.title').text().trim();
a
      const authorElement = $(element).find('.creator a');
      const author = authorElement.text().trim();
      const authorProfileUrl = authorElement.attr('href');

      const categoryName = $(element).find('.category-name').text().trim();

      forumPosts.push({ topicId, title, authorProfileUrl, categoryName });
    });

    res.json({ forumPosts });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping forum data' });
  }
});

app.get('/forums/latest', async (req, res) => {
  try {
    const url = 'https://us.forums.blizzard.com/en/overwatch/latest';
    const response = await axios.get(url);
    const html = response.data;

    const latestPosts = [];

    const $ = cheerio.load(html);
    $('.topic-list-item').each((index, element) => {
      const topicId = $(element).attr('data-topic-id');
      const title = $(element).find('.title').text().trim();

      const authorElement = $(element).find('.creator a');
      const author = authorElement.text().trim();
      const authorProfileUrl = authorElement.attr('href');

      const categoryName = $(element).find('.category-name').text().trim();

      latestPosts.push({ topicId, title, author, authorProfileUrl, categoryName });
    });

    res.json({ latestPosts });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping forum data' });
  }
});

app.get('/forums/bug-reports/posts', async (req, res) => {
  try {
    const url = 'https://us.forums.blizzard.com/en/overwatch/c/bug-reports/9';
    const response = await axios.get(url);
    const html = response.data;

    const latestPosts = [];

    const $ = cheerio.load(html);
    $('.topic-list-item').each((index, element) => {
      const topicId = $(element).attr('data-topic-id');
      const title = $(element).find('.title').text().trim();

      const authorElement = $(element).find('.creator a');
      const author = authorElement.text().trim();
      const authorProfileUrl = authorElement.attr('href');

      const categoryName = $(element).find('.category-name').text().trim();

      latestPosts.push({ topicId, title });
    });

    res.json({ latestPosts });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping forum data' });
  }
});


app.listen(port, () => {
  console.log(`owinsights is running on port ${port}`);
});