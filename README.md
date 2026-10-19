# Triển khai lên Netlify

Đây là bản sao tĩnh của website, không cần cài đặt package. Kết nối repository với Netlify; cấu hình trong `netlify.toml` sẽ chạy `bash build.sh` và xuất bản thư mục `dist`.

Có thể chạy `bash build.sh` ở máy để tạo bản triển khai và dùng một máy chủ HTTP tĩnh để xem thư mục `dist` (ví dụ `python3 -m http.server --directory dist`). Trang gốc sẽ chuyển đến thiệp cưới.

Sổ lưu bút sử dụng Netlify Function để truy cập Supabase. Trong Netlify, mở **Project configuration → Environment variables** và thêm:

- `SUPABASE_URL`: URL của project Supabase, ví dụ `https://your-project.supabase.co`.
- `SUPABASE_PUBLISHABLE_KEY`: publishable key (`sb_publishable_…`) hoặc anon key cũ của project. Không dùng secret key hoặc `service_role`.

Nếu có lựa chọn scope, chọn **Functions** (hoặc All scopes). Tạo deploy mới sau khi thay đổi các biến. Khóa chỉ được đọc bởi Function, không được đưa vào mã trình duyệt. Cần tạo bảng và chính sách RLS theo `supabase/guestbook.sql` nếu chưa có; các lời chúc được công khai để khách đọc và gửi. Dùng `netlify dev` để chạy Function khi thử nghiệm ở máy; HTTP server tĩnh chỉ hiển thị giao diện. Bản đồ hiện không cần Google API key. Nhạc và một số dịch vụ bên ngoài vẫn cần kết nối mạng.

Có thể điền các giá trị vào `.env` (tạo từ `.env.example` nếu chưa có), rồi nhập cả file trong Netlify qua **Add a variable → Import from a .env file** hoặc chạy `netlify env:import .env`. Không commit `.env`; file này đã được thêm vào `.gitignore`.

Truy cập `/admin` để tạo liên kết thiệp chung hoặc liên kết có tên khách mời. Trước khi tạo liên kết có tên, chạy [supabase/invitation-links.sql](supabase/invitation-links.sql) trong SQL Editor của cùng dự án Supabase và cấu hình hai biến môi trường ở trên cho Functions. Liên kết mới dùng đường dẫn `/thiep` hoặc `/m/s_...`; tên khách được lưu trong Supabase và tra cứu theo mã ngẫu nhiên. Function tạo phần xem trước có ảnh và lời mời rồi đưa khách tới thiệp. Cần chạy `netlify dev` hoặc triển khai lên Netlify để thử các liên kết này; HTTP server tĩnh không chạy Function. Các liên kết cũ dùng tham số `guest` hoặc mã hóa tên trong đường dẫn vẫn hoạt động. Bất kỳ ai có liên kết đều có thể xem tên khách, và trang `/admin` hiện không yêu cầu đăng nhập.
