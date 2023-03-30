const getString = (view: DataView, offset: number, length: number) => {
  const charCodes = [];
  for (let i = 0; i < length; i++) {
    const charCode = view.getUint8(offset + i);
    charCodes.push(charCode);
  }
  return String.fromCharCode(...charCodes);
};

/**
 * ボックスのHeader部の情報だけを得るイテレーターを返します。
 * @param videoBlob 動画ファイルのBlob
 * @param options
 */
async function* iterateBoxHeaders(
  videoBlob: Blob,
  options?: { start?: number; end?: number },
) {
  let offset = options?.start || 0;
  const end = Math.min(options?.end || videoBlob.size, videoBlob.size);

  while (true) {
    if (offset >= end) {
      console.log("break", offset, end);
      break;
    }

    const view = new DataView(
      await videoBlob.slice(offset, offset + 8).arrayBuffer(),
    );
    const size = view.getUint32(0);
    const type = getString(view, 4, 4);
    yield { offset, size, type };

    offset += size;
  }
}

type Box = {
  header: {
    offset: number;
    size: number;
    type: string;
  };
  children: AsyncGenerator<Box>;
};

/**
 * ボックスのHeader部と子ボックス用のイテレータを含む、`Box`オブジェクトを得るイテレーター
 * @param videoBlob 動画ファイルのBlob
 * @param options
 * @returns イテレーター
 */
export async function* iterateBoxes(
  videoBlob: Blob,
  options?: { parent?: { offset: number; size: number } },
): AsyncGenerator<Box> {
  const parent = options?.parent;

  const headers = (() => {
    if (parent) {
      const offset = parent.offset;
      const size = parent.size;

      return iterateBoxHeaders(videoBlob, {
        start: offset + 8,
        end: (offset + size) - 8,
      });
    } else {
      return iterateBoxHeaders(videoBlob);
    }
  })();

  for await (const header of headers) {
    yield {
      header,
      children: iterateBoxes(videoBlob, {
        parent: header,
      }),
    };
  }
}
