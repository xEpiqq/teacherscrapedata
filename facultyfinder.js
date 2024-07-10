import puppeteer from 'puppeteer';
async function getSchoolsPage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract all links
    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        return anchors.map(anchor => ({
            text: anchor.textContent.trim(),
            href: anchor.href
        }));
    });

    // Find a link that likely points to the schools page
    const schoolsLink = links.find(link => {
        const text = link.text.toLowerCase();
        return text.includes('schools') || text.includes('our schools') || text.includes('school list') || text.includes('campuses');
    });

    if (schoolsLink) {
        console.log('Found Schools page:', schoolsLink.href);
    } else {
        console.log('Schools page not found.');
    }

    await browser.close();
}

// Replace with the actual URL of the school district website
const url = 'https://www.pellcityschools.net';
getSchoolsPage(url);