import axios from 'axios';
import xml2js from 'xml2js';
import * as cheerio from 'cheerio';

// Danh sách các danh mục mong muốn
const allowedCategories = [
  'Spa',
  'Doanh Nghiệp',
  'Khách Sạn',
  'Nhà Hàng',
  'Hair Salon',
  'Tiệm Nail',
  'Quán Cafe',
  'Barber',
  'Studio',
  'Phụ Kiện Đồng Phục'
];

// Hàm để lọc và chuẩn hóa danh mục sản phẩm
function extractDesiredCategory(rawCategory) {
  const categoryParts = rawCategory
    .split(',')
    .map((category) => category.trim());

  const cleanedCategories = categoryParts
    .map((category) => {
      for (const allowed of allowedCategories) {
        if (category.toLowerCase().includes(allowed.toLowerCase())) {
          return allowed;
        }
      }
      return null;
    })
    .filter(Boolean);

  const uniqueCategories = [...new Set(cleanedCategories)];
  return uniqueCategories.length > 0 ? uniqueCategories.join(', ') : 'Category not found';
}

// Hàm để tải và phân tích XML từ một URL
export async function fetchAndParseXML(url) {
  try {
    console.log(`Đang lấy dữ liệu từ sitemap: ${url}`);
    const response = await axios.get(url);
    const parser = new xml2js.Parser();
    return await parser.parseStringPromise(response.data);
  } catch (error) {
    console.error(`Lỗi khi tải và phân tích sitemap từ URL: ${url}`, error);
    throw new Error(`Không thể tải hoặc phân tích nội dung từ ${url}`);
  }
}

// Giữ nguyên hàm getMainCategoryNamesFromSitemap như yêu cầu
export async function getMainCategoryNamesFromSitemap(sitemapUrl) {
  const sitemapData = await fetchAndParseXML(sitemapUrl);

  // Lấy tất cả các sitemap con trong sitemap_index.xml
  const sitemapUrls = sitemapData.sitemapindex.sitemap.map((item) => item.loc[0]);

  // Lọc các sitemap con liên quan đến danh mục sản phẩm
  const categoryUrls = sitemapUrls.filter((url) =>
    url.includes('product') || url.includes('category') || url.includes('danh-muc')
  );

  let mainCategoryNames = new Set();

  // Duyệt qua từng URL của sitemap con và lấy tên danh mục chính
  for (const url of categoryUrls) {
    console.log(`Đang xử lý sitemap con: ${url}`);
    const subSitemap = await fetchAndParseXML(url);

    if (subSitemap.urlset && subSitemap.urlset.url) {
      subSitemap.urlset.url.forEach((item) => {
        const loc = item.loc[0];
        const name = loc.split('/').slice(-2, -1)[0]; // Lấy tên danh mục từ URL

        // Điều kiện lọc để lấy **danh mục chính** (không chứa sản phẩm chi tiết)
        const isMainCategory = [
          'dong-phuc-spa',
          'dong-phuc-doanh-nghiep',
          'dong-phuc-khach-san',
          'dong-phuc-nha-hang',
          'dong-phuc-hair-salon',
          'dong-phuc-tiem-nail',
          'dong-phuc-quan-cafe',
          'dong-phuc-barber',
          'dong-phuc-studio',
          'phu-kien-dong-phuc'
        ].includes(name); // So sánh với danh sách từ khóa danh mục chính

        // Nếu đúng là danh mục chính, thêm vào Set để đảm bảo không trùng lặp
        if (isMainCategory) {
          mainCategoryNames.add(name);
        }
      });
    }
  }

  // Chuyển Set sang mảng và trả về các tên danh mục chính
  return Array.from(mainCategoryNames);
}

// Hàm để lấy tất cả URL sản phẩm từ các sitemaps con
export async function getAllProductUrls(mainSitemapUrl) {
  const sitemapData = await fetchAndParseXML(mainSitemapUrl);
  const productSitemaps = sitemapData.sitemapindex.sitemap
    .map((item) => item.loc[0])
    .filter((url) => url.includes('product-sitemap'));

  let allProductUrls = [];
  for (const sitemap of productSitemaps) {
    const subSitemap = await fetchAndParseXML(sitemap);
    const productUrls = subSitemap.urlset.url.map((item) => item.loc[0]);
    allProductUrls.push(...productUrls);
  }
  return allProductUrls;
}

// Hàm để lấy tất cả các hình ảnh từ slider
function getImagesFromSlider($) {
  const sliderImages = [];
  $('div.woocommerce-product-gallery__image.slide, div.flickity-slider img').each((index, element) => {
    const imgUrl = $(element).attr('data-thumb') || $(element).attr('src') || $(element).attr('data-src') || $(element).attr('href') || $(element).attr('srcset');
    if (imgUrl && imgUrl.startsWith('http')) {
      sliderImages.push(imgUrl);
    }
  });
  return sliderImages;
}

// Hàm để lấy tất cả các hình ảnh từ sản phẩm
async function scrapeProductImages(productUrl) {
  try {
    const response = await axios.get(productUrl);
    const $ = cheerio.load(response.data);
    const imageProduct = [];

    const mainImage = $('img.wp-post-image.ux-skip-lazy').attr('src');
    if (mainImage) {
      imageProduct.push(mainImage);
    }

    const sliderImages = getImagesFromSlider($);
    imageProduct.push(...sliderImages);

    return imageProduct;
  } catch (error) {
    console.error('Error while scraping product images:', productUrl, error);
    return [];
  }
}

// Hàm để scrape thông tin chi tiết sản phẩm sau khi đã có imageProduct
async function scrapeProductDetails(productUrl, imageProduct) {
  try {
    const response = await axios.get(productUrl);
    const $ = cheerio.load(response.data);

    const productName = $('h1.product_title.entry-title').text().trim() || 'Name not found';
    const shortDescription = $('ul.thongtin-themsanpham li')
      .map((i, el) => $(el).text().trim())
      .get()
      .join('\n') || '';
    const detailedDescription = $('#tab-description p, #tab-description ul, #tab-description li')
      .map((i, el) => $(el).text().trim())
      .get()
      .join('\n') || '';
    const productDescription = [shortDescription, detailedDescription].filter(Boolean).join('\n\n') || 'Description not available';

    const rawCategory = $('span.posted_in a')
      .map((i, el) => $(el).text().trim())
      .get()
      .join(', ') || '';
    const productCategory = extractDesiredCategory(rawCategory);

    return {
      productName,
      productDescription,
      imageProduct,
      productCategory,
      productLink: productUrl,
    };
  } catch (error) {
    console.error('Error while scraping product details:', productUrl, error);
    return null;
  }
}

//Hàm chính để scrape tất cả sản phẩm từ sitemap
export async function scrapeAllProductsFromSitemap(mainSitemapUrl) {
  const productUrls = await getAllProductUrls(mainSitemapUrl);
  const allProductDetails = [];

  for (const [index, productUrl] of productUrls.entries()) {
    console.log(`\nScraping product ${index + 1}/${productUrls.length}: ${productUrl}`);
    const imageProduct = await scrapeProductImages(productUrl);

    const productData = await scrapeProductDetails(productUrl, imageProduct);
    if (productData) {
      allProductDetails.push(productData);
    }
  }

  console.log('\nAll Products Scraped Successfully. Total:', allProductDetails.length);
  return allProductDetails;
}

// // Hàm chính để scrape tất cả sản phẩm từ sitemap với số lượng giới hạn
// export async function scrapeAllProductsFromSitemap(mainSitemapUrl, limit = 50) {
//   // Bước 1: Lấy tất cả các URL sản phẩm từ sitemap
//   const productUrls = await getAllProductUrls(mainSitemapUrl);

//   // Bước 2: Giới hạn số lượng URL dựa trên tham số 'limit' (mặc định là 50)
//   const limitedProductUrls = productUrls.slice(0, limit);

//   console.log(`\nScraping up to ${limitedProductUrls.length} products from the sitemap.`);

//   // Bước 3: Duyệt qua từng URL sản phẩm và thu thập thông tin
//   const allProductDetails = [];
//   for (const [index, productUrl] of limitedProductUrls.entries()) {
//     console.log(`\nScraping product ${index + 1}/${limitedProductUrls.length}: ${productUrl}`);
//     const imageProduct = await scrapeProductImages(productUrl);

//     // Nếu không có hình ảnh, bỏ qua sản phẩm này
//     if (imageProduct.length === 0) {
//       console.log('No images found. Skipping this product...');
//       continue;
//     }

//     const productData = await scrapeProductDetails(productUrl, imageProduct);
//     if (productData) {
//       allProductDetails.push(productData);
//     }
//   }

//   console.log(`\nAll Products Scraped Successfully. Total: ${allProductDetails.length}`);
//   return allProductDetails;
// }

