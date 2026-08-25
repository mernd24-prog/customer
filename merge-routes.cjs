const fs = require('fs');
const path = require('path');

const modules = ['products', 'orders', 'cart', 'returns', 'auth', 'checkout'];

for (const mod of modules) {
  const routesDir = path.join('src/modules', mod, 'routes');
  const apiRoutesPath = path.join(routesDir, 'apiRoutes.js');
  
  // The frontend routes file might be named productRoutes.js, orderRoutes.js, etc.
  // Let's just find any file that ends with Routes.js and is NOT apiRoutes.js
  if (fs.existsSync(routesDir)) {
    const files = fs.readdirSync(routesDir);
    const frontendFile = files.find(f => f.toLowerCase().includes(mod) && f.endsWith('Routes.js'));
    
    if (frontendFile) {
      const frontendPath = path.join(routesDir, frontendFile);
      const frontendContent = fs.readFileSync(frontendPath, 'utf8');
      
      let apiRoutesContent = '';
      if (fs.existsSync(apiRoutesPath)) {
        apiRoutesContent = fs.readFileSync(apiRoutesPath, 'utf8');
      }
      
      // Merge them
      const mergedContent = apiRoutesContent + '\n\n' + frontendContent;
      fs.writeFileSync(apiRoutesPath, mergedContent);
      console.log(`Merged ${frontendFile} into apiRoutes.js for module ${mod}`);
      
      // Delete the old file
      fs.unlinkSync(frontendPath);
    }
  }
}

// Update AppRoutes.jsx to import from apiRoutes.js instead of moduleRoutes.js
const appRoutesPath = 'src/routing/AppRoutes.jsx';
if (fs.existsSync(appRoutesPath)) {
  let content = fs.readFileSync(appRoutesPath, 'utf8');
  content = content.replace(/import\s+\{\s*([A-Z_]+)\s*\}\s+from\s+"([^"]+)(auth|product|order|checkout|cart|returns)Routes";/g, 'import { $1 } from "$2apiRoutes";');
  fs.writeFileSync(appRoutesPath, content);
  console.log('Updated AppRoutes.jsx');
}

