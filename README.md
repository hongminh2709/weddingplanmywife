# Triển khai lên Netlify

Đây là bản sao tĩnh của website, không cần cài đặt package. Kết nối repository với Netlify; cấu hình trong `netlify.toml` sẽ chạy `bash build.sh` và xuất bản thư mục `dist`.

Có thể chạy `bash build.sh` ở máy để tạo bản triển khai và dùng một máy chủ HTTP tĩnh để xem thư mục `dist` (ví dụ `python3 -m http.server --directory dist`). Trang gốc sẽ chuyển đến thiệp cưới.

Sổ lưu bút sử dụng Netlify Function để truy cập Supabase. Trong Netlify, mở **Project configuration → Environment variables** và thêm:

- `SUPABASE_URL`: URL của project Supabase, ví dụ `https://your-project.supabase.co`.
- `SUPABASE_PUBLISHABLE_KEY`: publishable key (`sb_publishable_…`) hoặc anon key cũ của project. Không dùng secret key hoặc `service_role`.

Nếu có lựa chọn scope, chọn **Functions** (hoặc All scopes). Tạo deploy mới sau khi thay đổi các biến. Khóa chỉ được đọc bởi Function, không được đưa vào mã trình duyệt. Cần tạo bảng và chính sách RLS theo `supabase/guestbook.sql` nếu chưa có; các lời chúc được công khai để khách đọc và gửi. Dùng `netlify dev` để chạy Function khi thử nghiệm ở máy; HTTP server tĩnh chỉ hiển thị giao diện. Bản đồ hiện không cần Google API key. Nhạc và một số dịch vụ bên ngoài vẫn cần kết nối mạng.

Có thể điền các giá trị vào `.env` (tạo từ `.env.example` nếu chưa có), rồi nhập cả file trong Netlify qua **Add a variable → Import from a .env file** hoặc chạy `netlify env:import .env`. Không commit `.env`; file này đã được thêm vào `.gitignore`.

Truy cập `/admin` để tạo liên kết thiệp chung hoặc liên kết có tên khách mời. Tên khách được lưu trong chính đường dẫn, không lưu vào database; bất kỳ ai có đường dẫn đều có thể xem tên. Trang `/admin` hiện không yêu cầu đăng nhập và chỉ dùng để tạo liên kết.
