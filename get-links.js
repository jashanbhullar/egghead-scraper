const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");

const COURSE_URL = process.argv[2];

if (!COURSE_URL) {
  console.log("Please provide a course url.");
  process.exit(0);
}

const getPage = url => {
  return new Promise((resolve, reject) => {
    https
      .request(url, res => {
        let responseData = "";

        res.on("data", d => (responseData += d));

        res.on("end", () => {
          resolve(responseData);
        });
      })
      .on("error", e => reject(e))
      .end();
  });
};

(async () => {
  try {
    const page = await getPage(COURSE_URL);
    const $ = cheerio.load(page);

    const data = JSON.parse(
      $('script[type="application/json"][data-component-name="App"]')[0]
        .children[0].data
    );

    const lessons = [];
    const title = data.course.course.title;

    for (const lesson of data.course.course.lessons) {
      const {
        title,
        media_urls: { hls_url: url }
      } = lesson;

      lessons.push({
        title,
        url
      });
    }

    const toDownload = {
      title,
      lessons
    };

    fs.writeFileSync("episode-links.json", JSON.stringify(toDownload, null, 4));
    console.log(`File saved, total ${lessons.length} episodes to download`);
  } catch (err) {
    console.log("Downloading of the urls failed");
    throw err;
  }
})();
