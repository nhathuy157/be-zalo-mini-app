import axios from 'axios';

export const getOrderDetails = async (limit = 10, skip = 20, zaloToken) => {
    try {
        const response = await axios.post(
            `${process.env.API_URL}/zalo/orders/list`,
            {
                limit,
                skip,
                zalo_token: zaloToken
            },
            {
                'Content-Type': 'application/json'
            }
        );
        console.log(response.data);

        return response.data; // Trả về dữ liệu từ response nếu thành công
    } catch (error) {
        console.error('Lỗi khi gọi API', error.message);
        throw new Error(error.response ? error.response.data : " Lỗi khi call API");
    }
};

// async function getOrder(order_hash: string, brand: string) {
//     try {
//       const _brand = brand !== 'default' && Object.keys(dataRef).includes(brand) ? brand : 'thientrang';
  
//         // const response = await fetch(`https://sapi.btpc.vn/v1/api/getOrderDetail?order_hash=${order_hash}`); // api gốc
        
//         const response = await fetch(`https://apidonhang.${_brand}.vn/getOrderDetail?order_hash=${order_hash}`);
//         const res_json = await response.json();
//         console.log(brand);
//         if (!response.ok) {
//           console.log(brand);
//             throw new Error(JSON.stringify(res_json));
//         }
//         return res_json;
//     } catch (error) {
//       console.log(brand);
//       console.error("Error fetching order details:", error);
//       throw error;
//     }
//   }