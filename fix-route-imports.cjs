const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Pattern to catch 'from "../modules/auth/routes/authRoutes"' and variants
    content = content.replace(/from\s+['"]([^'"]+?)\/modules\/([^/]+)\/routes\/(?:auth|product|order|checkout|cart|returns)Routes['"]/g, 'from "$1/modules/$2/routes/apiRoutes"');

    // Pattern to catch 'from "../../routes/authRoutes"' when inside a module
    content = content.replace(/from\s+['"]([^'"]+?)\/routes\/(?:auth|product|order|checkout|cart|returns)Routes['"]/g, 'from "$1/routes/apiRoutes"');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && !file.startsWith('.')) {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory('src');
console.log("Imports fix complete.");
