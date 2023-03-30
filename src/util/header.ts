export const boxHeaderToMP4ArrayBuffer = async (
  blob: Blob,
  header: { offset: number; size: number },
) => {
  const offset = header.offset;
  const size = header.size;
  const sliced = await blob.slice(offset, offset + size).arrayBuffer();
  return Object.assign(sliced, {
    fileStart: offset,
  });
};
