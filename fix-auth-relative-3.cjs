const fs = require('fs');
const path = require('path');

function replaceRelative(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceRelative(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/"\.\.\/\.\.\/validations/g, '"../../../validations');
      content = content.replace(/"\.\.\/\.\.\/assets/g, '"../../../assets');
      
      fs.writeFileSync(fullPath, content);
      console.log('Fixed', fullPath);
    }
  }
}

replaceRelative('src/modules/auth');
