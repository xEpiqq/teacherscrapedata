import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// Function to extract links from a given URL
const extractLinks = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Select all links within the table with class "infobox"
    const links = [];
    $('.infobox a').each((i, element) => {
      const link = $(element).attr('href');
      if (link && (link.startsWith('http') || link.startsWith('https'))) {
        links.push(link);
      }
    });

    return links;
  } catch (error) {
    console.error(`Error fetching the page: ${url}`, error);
    return [];
  }
};

// Function to process a single JSON file
const processFile = async (filename) => {
  const filePath = path.join('./', filename);
  const data = JSON.parse(fs.readFileSync(filePath));
  const results = [];
  let count = 0;

  for (const district of data.links) {
    const { text, href } = district;
    console.log(`Processing: ${text}`);
    const links = await extractLinks(href);

    if (links.length > 0) {
      results.push({ name: text, site: links[0] });
      count++;
    } else {
      results.push({ name: text, site: 'No valid link found' });
    }
  }

  const outputFilename = path.join('./', path.basename(filename).replace('_school_districts', ''));
  fs.writeFileSync(outputFilename, JSON.stringify(results, null, 2));

  return count;
};

// Function to process all JSON files in the directory
const processAllFiles = async () => {
  const files = fs.readdirSync('./').filter(file => file.endsWith('_school_districts.json'));
  let totalLinks = 0;

  for (const file of files) {
    console.log(`Processing file: ${file}`);
    const count = await processFile(file);
    totalLinks += count;
  }

  console.log(`Total number of site links extracted: ${totalLinks}`);
};

processAllFiles();
