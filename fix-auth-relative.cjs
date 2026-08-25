const fs = require('fs');
const glob = require('glob'); // Need to install glob or just use simple readdir

const path = require('path');

function replaceRelative(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceRelative(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We are in modules/auth/pages/ (depth 4) or modules/auth/components/ (depth 4)
      // They used to be in pages/auth/ (depth 3) or features/auth/ (depth 3)
      // So ../../ goes to src, now it needs to go to src (../../../)
      
      // Specifically replace "../../components/" to "../../../components/"
      content = content.replace(/"\.\.\/\.\.\/components/g, '"../../../components');
      content = content.replace(/"\.\.\/\.\.\/utils/g, '"../../../utils');
      content = content.replace(/"\.\.\/\.\.\/api/g, '"../../../api');
      content = content.replace(/"\.\.\/\.\.\/constants/g, '"../../../constants');
      content = content.replace(/"\.\.\/\.\.\/features/g, '"../../../features');
      
      fs.writeFileSync(fullPath, content);
      console.log('Fixed', fullPath);
    }
  }
}

replaceRelative('src/modules/auth');
