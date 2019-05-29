const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const Multiprogress = require("multi-progress");
const progressBars = new Multiprogress(process.stderr);

const MAX_PARALLEL_DOWNLOADS = 5;
const LINKS = process.argv[2].toString();
const START_INDEX = +process.argv[3] - 1;
const END_INDEX = +process.argv[4];

const toDownload = require("./" + LINKS);
const DIRECTORY_NAME = "reward/" + toDownload.title;

try {
  fs.mkdirSync(DIRECTORY_NAME, { recursive: true });
} catch {
  console.log("Error in making directory");
  process.exit(1);
}

if (
  isNaN(START_INDEX) ||
  isNaN(END_INDEX) ||
  START_INDEX < 0 ||
  END_INDEX < START_INDEX ||
  END_INDEX <= 0
) {
  console.log("Please specify both start and end index");
  process.exit(0);
}

(async () => {
  const links = toDownload.lessons;
  if (links.length === 0) {
    console.log("0 episodes to download, exiting ");
  }

  const linkstoDownload = links.slice(START_INDEX, END_INDEX);
  console.log("Total links to be downloaded", linkstoDownload.length);

  while (linkstoDownload.length > 0) {
    await Promise.all(
      linkstoDownload
        .splice(0, MAX_PARALLEL_DOWNLOADS)
        .map(link => download(link, links.findIndex(el => el === link) + 1))
    );

    console.log(linkstoDownload.length, "downloads left");
  }
})();

async function download({ url: link, title }, index) {
  const name = `${index}.${title.replace(/\//g, "-").replace(/\\/g, "-")}.mp4`;
  await new Promise((resolve, reject) => {
    const bar = progressBars.newBar(`${name} [:bar]  :percent :etas`, {
      complete: "=",
      incomplete: " ",
      width: 20,
      total: 100
    });
    ffmpeg(link)
      .on("error", error => {
        reject(new Error(error));
      })
      .on("end", () => {
        resolve();
      })
      .on("progress", progress => {
        bar.update(progress.percent / 100);
      })
      .outputOptions("-c copy")
      .outputOptions("-bsf:a aac_adtstoasc")
      .output(`${DIRECTORY_NAME}/${name}`)
      .run();
  });
}
