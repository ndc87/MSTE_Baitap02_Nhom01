require('dotenv').config();
const http = require('http');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } 
        catch(e) { reject(new Error('Invalid JSON: ' + data.substring(0, 200))); }
      });
    }).on('error', reject);
  });
}

async function test() {
  console.log('=== Testing Homepage API ===');
  const homepage = await fetchJSON('http://localhost:5000/api/public/homepage');
  
  if (!homepage.success) {
    console.log('FAIL: Homepage returned success=false');
    console.log(homepage);
    return;
  }

  const firstProduct = homepage.data.newArrivals?.[0];
  if (firstProduct) {
    console.log('First product name:', firstProduct.name);
    console.log('sellingPrice:', firstProduct.sellingPrice);
    console.log('mrpPrice:', firstProduct.mrpPrice);
    console.log('media:', firstProduct.media);
    console.log('Price OK?', firstProduct.sellingPrice > 0 ? 'YES ✅' : 'NO ❌');
    console.log('Media OK?', firstProduct.media?.length > 0 ? 'YES ✅' : 'NO ❌');
  } else {
    console.log('No newArrivals found');
  }

  console.log('\n=== Testing Search API ===');
  const search = await fetchJSON('http://localhost:5000/api/public/products');
  
  if (!search.success) {
    console.log('FAIL: Search returned success=false');
    console.log(search);
    return;
  }

  const firstSearchProduct = search.data?.[0];
  if (firstSearchProduct) {
    console.log('First search product:', firstSearchProduct.name);
    console.log('sellingPrice:', firstSearchProduct.sellingPrice);
    console.log('mrpPrice:', firstSearchProduct.mrpPrice);
    console.log('media:', firstSearchProduct.media);
    console.log('Price OK?', firstSearchProduct.sellingPrice > 0 ? 'YES ✅' : 'NO ❌');
    console.log('Media OK?', firstSearchProduct.media?.length > 0 ? 'YES ✅' : 'NO ❌');
  }

  console.log('\n=== Summary ===');
  const allProducts = search.data || [];
  const withPrice = allProducts.filter(p => p.sellingPrice > 0).length;
  const withMedia = allProducts.filter(p => p.media?.length > 0).length;
  console.log(`${withPrice}/${allProducts.length} products have price > 0`);
  console.log(`${withMedia}/${allProducts.length} products have media images`);
}

test().catch(console.error);
