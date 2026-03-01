const https = require('https');

/**
 * Fetch market prices from Thailand MOC Open Data API
 * @param {string} productId - Product ID (e.g., "P11012")
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {string} toDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Market price data
 */
function fetchMarketPrice(productId, fromDate, toDate) {
    return new Promise((resolve, reject) => {
        const url = `https://data.moc.go.th/OpenData/GISProductPrice?product_id=${productId}&from_date=${fromDate}&to_date=${toDate}&task=search`;
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    // Parse HTML response - extract prices using regex
                    const minPriceMatch = data.match(/ราคาต่ำสุดเฉลี่ย[^0-9]*([0-9.]+)/);
                    const maxPriceMatch = data.match(/ราคาสูงสุดเฉลี่ย[^0-9]*([0-9.]+)/);
                    const productNameMatch = data.match(/ชื่อสินค้า[^<]*<[^>]*>([^<]+)</);
                    
                    const result = {
                        productId: productId,
                        productName: productNameMatch ? productNameMatch[1].trim() : 'Unknown',
                        minPrice: minPriceMatch ? parseFloat(minPriceMatch[1]) : null,
                        maxPrice: maxPriceMatch ? parseFloat(maxPriceMatch[1]) : null,
                        avgPrice: minPriceMatch && maxPriceMatch ? 
                            (parseFloat(minPriceMatch[1]) + parseFloat(maxPriceMatch[1])) / 2 : null,
                        fromDate: fromDate,
                        toDate: toDate,
                        fetchedAt: new Date().toISOString()
                    };
                    
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Thai product IDs and their mapping to local crop names
const PRODUCT_MAP = {
    'P11012': { name: 'ไก่สดชำแหละ', localName: 'ไก่' },
    'P11001': { name: 'ข้าวเหนียว', localName: 'ข้าว' },
    'P14001': { name: 'มะม่วง', localName: 'มะม่วงน้ำดอกไม้' },
    'P12005': { name: 'มะเขือเทศ', localName: 'มะเขือเทศ' },
    'P12001': { name: 'กะหล่ำปลี', localName: 'ผักกาดหอม' },
};

module.exports = {
    fetchMarketPrice,
    PRODUCT_MAP
};