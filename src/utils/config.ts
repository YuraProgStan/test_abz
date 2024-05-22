import * as fs from 'fs';
import * as merge from 'deepmerge';
export const mergeFromFile = (json, filePath, key) => {
  if (fs.existsSync(filePath)) {
    const envConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (envConfig && envConfig[key]) {
      return merge(json, envConfig[key]);
    }
  }

  return json;
};
