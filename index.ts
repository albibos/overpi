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

app.get('/heroes', async (req, res) => {
  const { role } = req.query;

  try {
    const heroes = await Overwatch.heroes({ role });
    res.json(heroes);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching heroes' });
  }
});

app.get('/hero', async (req, res) => {
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

app.get('/search-players', async (req, res) => {
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

app.get('/bug-fixes', async (req, res) => {
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

app.get('/ow-media', async (req, res) => {
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

app.listen(port, () => {
  console.log(`owinsights is running on port ${port}`);
});