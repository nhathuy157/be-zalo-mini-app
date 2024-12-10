// controllers/sitemapController.js
import { scrapeAllProductsFromSitemap, getMainCategoryNamesFromSitemap } from '../services/sitemapServices.js';

const sitemapUrl = 'https://thientrang.vn/sitemap_index.xml';

// Bảng ánh xạ từ không dấu sang có dấu
const vietnameseMapping = {
  'spa': 'Spa',
  'doanh nghiep': 'Doanh Nghiệp',
  'khach san': 'Khách Sạn',
  'nha hang': 'Nhà Hàng',
  'hair salon': 'Hair Salon',
  'tiem nail': 'Tiệm Nail',
  'quan cafe': 'Quán Cafe',
  'barber': 'Barber',
  'studio' : 'Studio',
  'phu kien dong phuc': 'Phụ Kiện',
};

// Hàm định dạng lại tên danh mục từ dạng 'dong-phuc-doanh-nghiep' thành 'Doanh Nghiệp'
const formatCategoryName = (category) => {
  // Bỏ phần tiền tố "dong-phuc-"
  let formattedName = category.replace('dong-phuc-', '');

  // Chuyển các phần còn lại từ dạng 'doanh-nghiep' thành 'doanh nghiep' để so khớp với từ khóa trong bảng ánh xạ
  formattedName = formattedName.split('-').map((word) => word.toLowerCase()).join(' ');

  // Áp dụng bảng ánh xạ để chuyển từ không dấu sang có dấu
  formattedName = vietnameseMapping[formattedName] || formattedName; // Nếu không có trong bảng, giữ nguyên

  return formattedName;
};

// Controller để scrape dữ liệu và hiển thị tên các danh mục đã được định dạng
export const scrapeAndDisplayCategories = async () => {
  try {
    const categories = await getMainCategoryNamesFromSitemap(sitemapUrl);
    console.log('Danh mục chính đã scrape được (trước khi xử lý):');
    console.log(categories); // In ra tên các danh mục ban đầu

    // Xử lý định dạng lại tên danh mục
    const formattedCategories = categories.map((category) => formatCategoryName(category));
    
    console.log('Danh mục chính đã được định dạng:');
    console.log(formattedCategories); // In ra tên các danh mục sau khi định dạng
    return formattedCategories;
  } catch (error) {
    console.error('Lỗi khi scrape và lấy tên danh mục:', error);
  }
};

export const scrapeAllProductData = async () => {
  try {
    const products = await scrapeAllProductsFromSitemap(sitemapUrl);
    console.log('\nAll Products Data:\n', JSON.stringify(products, null, 2));
    return products;
  } catch (error) {
    console.error('Error scraping product data:', error);
  }
};


