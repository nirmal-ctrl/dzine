const refStr = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=for logo refer: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD";
const parts = [];
const regex = /data:(image\/\w+);base64,([A-Za-z0-9+/]+={0,2})/g;
let lastIndex = 0;
let match;
while ((match = regex.exec(refStr)) !== null) {
  const textPart = refStr.slice(lastIndex, match.index).trim();
  if (textPart) {
    parts.push({ text: textPart });
  }
  parts.push({
    inlineData: {
      mimeType: match[1],
      data: match[2]
    }
  });
  lastIndex = regex.lastIndex;
}
const remainingText = refStr.slice(lastIndex).trim();
if (remainingText) {
  parts.push({ text: remainingText });
}
console.log(JSON.stringify(parts, null, 2));
