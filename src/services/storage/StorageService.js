import fs from "fs";
import autoBind from "auto-bind";

class StorageService {
  constructor(folder) {
    this._folder = folder;

    autoBind(this);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error));
      fileStream.on("finish", () => resolve(filename));
      file.pipe(fileStream);
    });
  }
}

export default StorageService;
