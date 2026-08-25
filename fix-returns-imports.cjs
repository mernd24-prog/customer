const fs = require('fs');

const replacements = [
  { file: 'src/routing/AppRoutes.jsx', find: '../pages/returns/ReturnsPage.jsx', replace: '../modules/returns/pages/ReturnsPage.jsx' },
  { file: 'src/routing/AppRoutes.jsx', find: '../pages/returnRefund/ReturnsRefunds.jsx', replace: '../modules/returns/pages/ReturnsRefundsPage.jsx' },
  { file: 'src/modules/returns/pages/ReturnsRefundsPage.jsx', find: '../../features/returns/returnsSlice', replace: '../slices/returnsSlice' },
  { file: 'src/modules/returns/controllers/useReturnRequest.js', find: '../../../features/returns/returnsSlice', replace: '../slices/returnsSlice' },
  { file: 'src/modules/orders/controllers/useOrderDetail.js', find: '../../../features/returns/returnsSlice', replace: '../../returns/slices/returnsSlice' },
  { file: 'src/app/store.js', find: '../features/returns/returnsSlice', replace: '../modules/returns/slices/returnsSlice' }
];

for (const {file, find, replace} of replacements) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    fs.writeFileSync(file, content);
    console.log(`Replaced in ${file}`);
  } catch (err) {
    console.error(`Error in ${file}: ${err.message}`);
  }
}
