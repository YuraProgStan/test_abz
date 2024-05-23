import { mergeFromFile } from '../utils/config';
import { join } from 'path';

export default () => {
  const env = process.env.NODE_ENV || 'local';
  const configFilePath = join(__dirname, '../data/config.json');
  const credentialsFilePath = join(__dirname, '../data/credentials.json');

  let config = {
    env,
    app_dir: __dirname,
    name: 'test-abz',
  };
  try {
    config = mergeFromFile(config, configFilePath, env);
    config = mergeFromFile(config, credentialsFilePath, env);
  } catch (error) {
    console.error('Failed to load config:', error);
  }

  return config;
};
