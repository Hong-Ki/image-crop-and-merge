const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");
const fs = require("fs");
const mergeImg = require("merge-img");

function capture() {
  return new Promise((resolve, reject) => {
    ffmpeg({ source: "./sources/test.mp4" })
      .takeScreenshots(45, "./capture")
      .on("end", () => {
        resolve("capture done!");
      })
      .on("error", (error) => {
        console.error(error);
        reject();
      });
  });
}

async function crop() {
  fs.rmdirSync("./crop", { recursive: true });
  fs.mkdirSync("./crop");
  const reg = new RegExp(/[^\d]/gi);

  const images = fs
    .readdirSync("./capture")
    .sort((a, b) => parseInt(a.replace(reg, "") - b.replace(reg, "")))
    .map((file) => `./capture/${file}`);

  console.log(images);

  let index = 0;
  for (file of images) {
    const image = sharp(file);
    const { width, height } = await image.metadata();
    await image
      .extract({
        width: Math.floor(width / images.length),
        top: 0,
        height: height,
        left: Math.floor((width / images.length) * index),
      })
      .toFile(`./crop/crop-${index}.png`)
      .then(() => console.log("croped!"))
      .catch((err) => console.log(err));

    index++;
  }

  return "crop done !";
}

function merge() {
  return new Promise((resolve, reject) => {
    const reg = new RegExp(/[^\d]/gi);
    const images = fs
      .readdirSync("./crop")
      .sort((a, b) => parseInt(a.replace(reg, "") - b.replace(reg, "")))
      .map((file) => `./crop/${file}`);
    console.log(images);

    mergeImg(images).then((img) =>
      img.write("output.png", () => console.log("done!!"))
    );

    return "test";
  });
}

(async () => {
  const step1 = await capture();
  console.log(step1, 1);
  const step2 = await crop();
  console.log(step2, 2);
  const step3 = await merge();
  console.log(step3, 3);
})();
