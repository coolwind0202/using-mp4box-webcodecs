// captureStream API が型定義に無いので上書きして追加する
declare global {
  interface HTMLMediaElement {
    captureStream?(): MediaStream;
    mozCaptureStream?(): MediaStream;
  }
}

export {};
