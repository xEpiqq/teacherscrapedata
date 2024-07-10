import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

async function scrapeChoirContactInfo(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    const keywords = ["Vocal", "Choral", "Choir", "Music", "Ensemble"];
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
    let foundEmails = [];
    let foundContexts = [];

    const searchAroundKeyword = (text, keywordIndex, keyword) => {
        let chunkSize = 20;
        let foundEmail = false;
        let leftIndex = keywordIndex;
        let rightIndex = keywordIndex + keyword.length;

        while (!foundEmail && (leftIndex > 0 || rightIndex < text.length)) {
            leftIndex = Math.max(0, leftIndex - chunkSize);
            rightIndex = Math.min(text.length, rightIndex + chunkSize);
            const context = text.slice(leftIndex, rightIndex);
            const emailsInContext = context.match(emailRegex) || [];
            if (emailsInContext.length > 0) {
                foundEmails = foundEmails.concat(emailsInContext);
                foundContexts.push(context);
                foundEmail = true;
            }
        }
    };

    keywords.forEach(keyword => {
        let keywordIndex = html.indexOf(keyword);
        while (keywordIndex !== -1) {
            searchAroundKeyword(html, keywordIndex, keyword);
            keywordIndex = html.indexOf(keyword, keywordIndex + 1);
        }
    });

    foundEmails = [...new Set(foundEmails)];
    console.log('Found emails:', foundEmails);

    // const requestBody = {
    //     model: "LM Studio Community/Meta-Llama-3-8B-Instruct-GGUF",
    //     messages: [
    //         { role: "system", content: "Answer extremely short and concise. Give me the contact info for the most likely choir teacher." },
    //         { role: "user", content: foundContexts.join("\n\n") }
    //     ],
    //     temperature: 0.7
    // };

    // // Make the request to the local LLM
    // const response = await fetch('http://localhost:1234/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(requestBody)
    // });

    // const data = await response.json();
    // const message = data.choices[0].message.content;

    // // Log the response from the AI
    // console.log('Response from AI:', message);

    await browser.close();
}

// URL to scrape
const url = 'https://grhs.emeryschools.org/FacultyandStaff';

scrapeChoirContactInfo(url).catch(err => {
    console.error('Error:', err);
});
