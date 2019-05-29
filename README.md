### Egghead.io Scraper

A small node function to download lectures from egghead.io.
This only works for publicly available courses (because I didn't had the money to buy their subscription)

For example:
[https://egghead.io/courses/javascript-promises-in-depth](https://egghead.io/courses/javascript-promises-in-depth)

Steps to download:

#### Step 1

Copy the url of a publicly available course and then:

```
node get-links.js https://egghead.io/courses/javascript-promises-in-depth
```

this will generate a `links/[title-of-the-course].json` file

#### Step 2

Then you can download with `links/[title-of-course-file].json` `START_INDEX` and `END_INDEX`.

```
node download.js links/javascript-promises-in-depth 1 11
```

This will download videos in the batch of `5` by default.
