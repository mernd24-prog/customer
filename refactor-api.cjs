const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const { search, replace } of replacements) {
        content = content.replace(search, replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir, replacements) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath, replacements);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath, replacements);
        }
    }
}

// 1. PRODUCTS
processDirectory('src/modules/products', [
    { search: /endpoints\.products\./g, replace: 'PRODUCT_API_ENDPOINTS.' },
    { search: /import \{ endpoints \} from "[^"]+";/, replace: 'import { PRODUCT_API_ENDPOINTS } from "../routes/apiRoutes";' },
    { search: /import \{ endpoints \} from '.*?';/, replace: 'import { PRODUCT_API_ENDPOINTS } from "../routes/apiRoutes";' }
]);

// 2. ORDERS
processDirectory('src/modules/orders', [
    { search: /endpoints\.orders\./g, replace: 'ORDER_API_ENDPOINTS.' },
    { search: /import \{ endpoints \} from "[^"]+";/, replace: 'import { ORDER_API_ENDPOINTS } from "../routes/apiRoutes";' },
    { search: /import \{ endpoints \} from '.*?';/, replace: 'import { ORDER_API_ENDPOINTS } from "../routes/apiRoutes";' }
]);

// 3. CART
processDirectory('src/modules/cart', [
    { search: /endpoints\.carts\./g, replace: 'CART_API_ENDPOINTS.' },
    { search: /import \{ endpoints \} from "[^"]+";/, replace: 'import { CART_API_ENDPOINTS } from "../routes/apiRoutes";' },
    { search: /import \{ endpoints \} from '.*?';/, replace: 'import { CART_API_ENDPOINTS } from "../routes/apiRoutes";' }
]);

// 4. RETURNS
processDirectory('src/modules/returns', [
    { search: /endpoints\.returns\./g, replace: 'RETURNS_API_ENDPOINTS.' },
    { search: /import \{ endpoints \} from "[^"]+";/, replace: 'import { RETURNS_API_ENDPOINTS } from "../routes/apiRoutes";' },
    { search: /import \{ endpoints \} from '.*?';/, replace: 'import { RETURNS_API_ENDPOINTS } from "../routes/apiRoutes";' }
]);

// 5. AUTH
processDirectory('src/modules/auth', [
    { search: /endpoints\.auth\./g, replace: 'AUTH_API_ENDPOINTS.' },
    { search: /import \{ endpoints \} from "[^"]+";/, replace: 'import { AUTH_API_ENDPOINTS } from "../routes/apiRoutes";' },
    { search: /import \{ endpoints \} from '.*?';/, replace: 'import { AUTH_API_ENDPOINTS } from "../routes/apiRoutes";' }
]);

console.log("Refactoring complete");
