import { basename as baseNamePath } from 'path';
import { readFile } from 'fs-promise';
export function descriptionQuestion() {
  return {
    name: 'name',
    message: 'What is the name of this project?',
    default(answers, directory) {
      return baseNamePath(directory);
    },
    async when(answers, directory) {
      if ('name' in answers) {
        return false;
      }
      try {
        const name = JSON.parse(await readFile(`${directory}/package.json`, 'utf8')).name;
        if (name) {
          answers.name = name;
          return false;
        }
        return true;
      } catch (error) {
        return true;
      }
    },
  };
}
export default descriptionQuestion;
