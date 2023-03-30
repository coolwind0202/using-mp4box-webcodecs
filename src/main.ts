import MP4Box from "mp4box";
import { iterateBoxes } from "./box";
import { boxHeaderToMP4ArrayBuffer } from "./util/header";

const getVideoElement = () => {
  const element = document.getElementById("video");
  if (!(element instanceof HTMLVideoElement)) {
    throw new TypeError("video must be HTMLVideoElement");
  }
  return element;
};

const fetchBlobFromURL = async (url: string) => {
  const res = await fetch(url);
  const blob = await res.blob();
  console.log(blob);
  return blob;
};

const main = async () => {
  const video = getVideoElement();
  const videoBlob = await fetchBlobFromURL(video.src);

  const boxes = iterateBoxes(videoBlob);
  const file = MP4Box.createFile();

  file.onMoovStart = function () {
    console.log("moov-start-2");
  };
  file.onReady = (e) => {
    console.table(e);
  };
  file.onError = (e) => {
    console.error(e);
  };

  for await (const box of boxes) {
    console.table(box.header);

    // 注意！今のままだとボックスのtypeが適正かを確認していないため、boxやchildがどのような値になっているかわからない → size をめちゃくちゃな場所から取ってきかねない
    // typeが正しいかどうかはどう判定すればいいのかな？？

    if (box.header.type === "ftyp") {
      console.log("ftyp");
      const sliced = await boxHeaderToMP4ArrayBuffer(videoBlob, box.header);
      file.appendBuffer(sliced);
    }

    if (box.header.type === "moov") {
      console.log("moov");
      const sliced = await boxHeaderToMP4ArrayBuffer(videoBlob, box.header);
      file.appendBuffer(sliced);
    }
  }

  file.flush();
  console.log("end");
};

main();
