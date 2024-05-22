import { mergeFromFile } from '../utils/config';
import { join } from 'path';

export default () => {
  const env = process.env.NODE_ENV || 'local';
  const configFilePath = join(__dirname, '../data/config.json');
  // const credentialsFilePath = join(__dirname, '../data/credentials.json'); //use for dev
    const replaceEnvVariables = (obj) => {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'object') {
                obj[key] = replaceEnvVariables(obj[key]);
            } else if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/\${(\w+)}/g, (match, p1) => {
                    return process.env[p1];
                });
            }
        });

        return obj;
    };

  let config = {
    env,
    app_dir: __dirname,
    name: 'test-abz',
  };
  try {
    config = mergeFromFile(config, configFilePath, env);
    config = replaceEnvVariables(config);
    // config = mergeFromFile(config, credentialsFilePath, env); //use for dev
  } catch (error) {
    console.error('Failed to load config:', error);
  }

  return config;
};
