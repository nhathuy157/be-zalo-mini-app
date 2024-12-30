import express from 'express'; // Import module Express để tạo ứng dụng web/API
import db from '../models'; // Import kết nối cơ sở dữ liệu từ thư mục 'models'
import router from express.Router(); // Tạo một Router mới của Express


/* Get orders history of logged in user */
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body; // Lấy dữ liệu payload từ request body
    console.log('[Webhook] Received payload', payload); // Ghi log payload nhận được để kiểm tra

    // Kiểm tra sự kiện trong payload và xử lý tương ứng
    switch (payload.event_name) {
      case 'follow': // Trường hợp sự kiện là 'follow'
        await processFollowEvent(payload); // Gọi hàm xử lý sự kiện follow
        break;

      case 'unfollow': // Trường hợp sự kiện là 'unfollow'
        await processUnfollowEvent(payload); // Gọi hàm xử lý sự kiện unfollow
        break;

      default: // Trường hợp sự kiện không được hỗ trợ
        console.log('[Webhook] Event not supported!', payload.event_name); // Ghi log thông báo
        break;
    }

    res.sendStatus(200); // Trả về mã trạng thái HTTP 200 OK, báo hiệu xử lý thành công
    console.log('[Webhook] Processed payload successfully!'); // Ghi log thông báo thành công
  } catch (error) {
    // Nếu có lỗi xảy ra, trả về lỗi với thông báo chung
    res.send({ error: -1, message: 'Unknown exception' });
    console.error('[Webhook] Exception', error); // Ghi log lỗi chi tiết để kiểm tra
  }
});

// Hàm xử lý sự kiện follow
async function processFollowEvent(payload) {
  const { user_id_by_app, follower } = payload; // Lấy thông tin user_id_by_app và follower từ payload
  const followerId = follower.id; // Lấy ID của người theo dõi từ thông tin follower

  // Cập nhật cơ sở dữ liệu, hoặc tạo bản ghi mới nếu không tồn tại (upsert)
  await db.Users.updateOne(
    {
      zaloId: user_id_by_app, // Điều kiện tìm bản ghi theo zaloId
    },
    {
      followerId, // Cập nhật followerId
      isFollowing: true, // Đánh dấu trạng thái đang theo dõi
    },
    {
      upsert: true, // Tạo bản ghi mới nếu không tìm thấy bản ghi phù hợp
    }
  );
}

// Hàm xử lý sự kiện unfollow
async function processUnfollowEvent(payload) {
  const { user_id_by_app, follower } = payload; // Lấy thông tin user_id_by_app và follower từ payload
  const followerId = follower.id; // Lấy ID của người theo dõi từ thông tin follower

  // Cập nhật cơ sở dữ liệu, hoặc tạo bản ghi mới nếu không tồn tại (upsert)
  await db.Users.updateOne(
    {
      zaloId: user_id_by_app, // Điều kiện tìm bản ghi theo zaloId
    },
    {
      followerId, // Cập nhật followerId
      isFollowing: false, // Đánh dấu trạng thái không còn theo dõi
    },
    {
      upsert: true, // Tạo bản ghi mới nếu không tìm thấy bản ghi phù hợp
    }
  );
}

// module.exports = router; 

export default router; // Xuất router này để sử dụng ở nơi khác trong ứng dụng
