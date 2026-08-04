const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, 'src/components/common/skeleton/layouts');
if (!fs.existsSync(layoutsDir)) {
  fs.mkdirSync(layoutsDir, { recursive: true });
}

const filesToProcess = [
  {
    file: 'src/pages/products/ProductDetailPage.jsx',
    regex: /const PRODUCT_DETAIL_SKELETON = \[([\s\S]*?)\];\n/g,
    name: 'productDetailSkeleton'
  },
  {
    file: 'src/pages/checkout/CheckoutPage.jsx',
    regex: /const CHECKOUT_PAGE_SKELETON = \[([\s\S]*?)\];\n/g,
    name: 'checkoutPageSkeleton'
  },
  {
    file: 'src/pages/cart/CartPage.jsx',
    regex: /const CART_PAGE_SKELETON = \[([\s\S]*?)\];\n/g,
    name: 'cartPageSkeleton'
  },
  {
    file: 'src/pages/orders/OrdersPage.jsx',
    regex: /const ORDER_LIST_SKELETON = \[([\s\S]*?)\];\n/g,
    name: 'orderListSkeleton'
  },
  {
    file: 'src/pages/returnRefund/ReturnsRefunds.jsx',
    regex: /const RETURNS_PAGE_SKELETON = \[([\s\S]*?)\];\n/g,
    name: 'returnsPageSkeleton'
  }
];

let indexJsContent = '';

filesToProcess.forEach(config => {
  const filePath = path.join(__dirname, config.file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let match;
  let hasReplaced = false;

  // We need to carefully extract the object. 
  // Since regex with [\s\S]*? might stop early or late if there are nested arrays, 
  // let's do a more robust manual parsing or just assume it works for these specific files since we know they end with "];\n".
  
  const searchStr = `const ${config.name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()} = [`;
  const startIdx = content.indexOf(searchStr);
  
  if (startIdx !== -1) {
    // find matching bracket
    let endIdx = -1;
    let bracketCount = 0;
    for (let i = startIdx + searchStr.length - 1; i < content.length; i++) {
      if (content[i] === '[') bracketCount++;
      if (content[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    
    if (endIdx !== -1) {
      // also remove the semicolon and newline if present
      let realEnd = endIdx + 1;
      if (content[realEnd] === ';') realEnd++;
      if (content[realEnd] === '\n') realEnd++;
      
      const objectCode = content.slice(startIdx, realEnd);
      content = content.slice(0, startIdx) + content.slice(realEnd);
      
      // Add import to the file
      const importLine = `import { ${config.name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()} } from "../../components/common/skeleton/layouts";\n`;
      // For OrdersPage, it might be in a different depth, let's just use absolute or compute
      // Wait, all these pages are in src/pages/*/, so depth is always "../../"
      
      const lastImportIdx = content.lastIndexOf('import ');
      const endOfLastImport = content.indexOf('\n', lastImportIdx) + 1;
      content = content.slice(0, endOfLastImport) + importLine + content.slice(endOfLastImport);
      
      fs.writeFileSync(filePath, content, 'utf8');
      
      // Write the layout file
      const exportCode = `export ` + objectCode;
      fs.writeFileSync(path.join(layoutsDir, `${config.name}.js`), exportCode, 'utf8');
      
      indexJsContent += `export { ${config.name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()} } from './${config.name}';\n`;
    }
  }
});

fs.writeFileSync(path.join(layoutsDir, 'index.js'), indexJsContent, 'utf8');
console.log("Done");
