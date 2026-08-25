const fs = require('fs');
const file = 'src/modules/cart/pages/CartPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace ../../ with ../../../ for non-modules
content = content.replace(/"\.\.\/\.\.\/components/g, '"../../../components');
content = content.replace(/"\.\.\/\.\.\/utils/g, '"../../../utils');
content = content.replace(/"\.\.\/\.\.\/constants/g, '"../../../constants');

// Fix modules imports (../../modules/products -> ../../products)
content = content.replace(/"\.\.\/\.\.\/modules\//g, '"../../');

// Check hooks
content = content.replace(/"\.\/hooks\//g, '"../controllers/');

// Also check CartItemCard.jsx and other components
fs.writeFileSync(file, content);
console.log('Fixed CartPage.jsx imports');
