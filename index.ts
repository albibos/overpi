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

app.get('/showcase/heroes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/overview.html'));
});

app.get('/showcase/hero', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/hero.html'));
});

app.get('/showcase/media', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/media.html'));
});

app.get('/heroes/:query?', async (req, res) => {
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

app.get('/hero', async (req, res) => {
  const { n } = req.query;

  if (!n) {
    return res.status(400).json({ error: 'Hero name is required' });
  }

  try {
    const hero = await Overwatch.hero(n.toString()).catch(() => null);

    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }

    res.json(hero);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching hero' });
  }
});

app.get('/gamemodes', async (req, res) => {
  try {
    const apiUrl = 'https://overfast-api.tekrop.fr/gamemodes';
    const response = await axios.get(apiUrl);

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data from the API.' });
  }
});

app.get('/maps', async (req, res) => {
  try {
    const baseUrl = 'https://overfast-api.tekrop.fr/maps';
    const gamemodeQuery = req.query.gm ? `?gamemode=${req.query.gm}` : '';
    const apiUrl = `${baseUrl}${gamemodeQuery}`;

    const response = await axios.get(apiUrl);

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data from the API.' });
  }
});

app.get('/roles', async (req, res) => {
  try {
    const baseUrl = 'https://overfast-api.tekrop.fr/roles';

    const response = await axios.get(baseUrl);

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data from the API.' });
  }
});

app.get('/player/search', async (req, res) => {
  const { n } = req.query;

  if (!n) {
    return res.status(400).json({ error: 'Player name is required' });
  }

  try {
    const playerSearchResult = await Overwatch.searchPlayers({ name: n.toString() });
    res.json(playerSearchResult);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while searching for players' });
  }
});

app.get('/player/summary', async (req, res) => {
  const { b } = req.query;

  if (!b) {
    return res.status(400).json({ error: 'Battletag is required' });
  }

  try {
    const playerSummary = await Overwatch.player(b.toString()).summary;
    res.json(playerSummary);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching player summary' });
  }
});

app.get('/hero-updates', async (req, res) => {
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

app.get('/general-updates', async (req, res) => {
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

app.get('/media/screenshots', async (req, res) => {
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

app.get('/media/artworks', async (req, res) => {
  try {
    const response = await axios.get('https://overwatch.blizzard.com/en-us/media/artworks/');
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

app.get('/battlepass', async (req, res) => {
  try {
    const url = 'https://overwatch.blizzard.com/en-us/season/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const freeBattlePassItems = $('blz-card[blz-modal-trigger="platform-selection-1"] div[slot="description"] li');
    const freeBattlePass = freeBattlePassItems.map((index, item) => $(item).text()).get();

    const premiumBattlePassItems = $('blz-card[blz-modal-trigger="battle-pass-modal-1"] div[slot="description"] li');
    const premiumBattlePass = premiumBattlePassItems.map((index, item) => $(item).text()).get();

    const invasionBundleItems = $('blz-card[blz-modal-trigger="invasion-modal-1"] div[slot="description"] li');
    const invasionBundle = invasionBundleItems.map((index, item) => $(item).text()).get();

    const seasonData = {
      freeBattlePass,
      premiumBattlePass,
      invasionBundle
    };

    res.json(seasonData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping season info.' });
  }
});

app.get('/blogs/:id', async (req, res) => {
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

app.get('/highlights', async (req, res) => {
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

// start of less useful stuff

// i dont know what anyone would need to scrape blizzard forums for.. but i was bored

app.get('/forums/top', async (req, res) => {
  try {
    const url = 'https://us.forums.blizzard.com/en/overwatch/top';
    const response = await axios.get(url);
    const html = response.data;

    const topPosts = [];

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

    res.json({ topPosts });
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

app.get('/forums/bug-reports/', async (req, res) => {
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

app.get('/owl', async (req, res) => {
  try {
    const response = await axios.get('https://www.overwatchleague.com/en-us/');
    const html = response.data;

    const $ = cheerio.load(html);

    const imgSrc = $('timeline-center-image picture img').attr('src');

    const upcomingLabel = $('upcoming-highlight highlight-label').text();
    const upcomingValue = $('upcoming-highlight highlight-value').text();

    res.json({
      imgSrc,
      upcoming: {
        label: upcomingLabel,
        value: upcomingValue,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
});

app.listen(port, () => {
  console.log(`owinsights is running on port ${port}`);
});