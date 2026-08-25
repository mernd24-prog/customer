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
      
      content = content.replace(/"\.\.\/\.\.\/hooks/g, '"../../../hooks');
      content = content.replace(/"\.\.\/\.\.\/lib/g, '"../../../lib');
      content = content.replace(/"\.\.\/\.\.\/config/g, '"../../../config');
      
      fs.writeFileSync(fullPath, content);
      console.log('Fixed', fullPath);
    }
  }
}

replaceRelative('src/modules/auth');
