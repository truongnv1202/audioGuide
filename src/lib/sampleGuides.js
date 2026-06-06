export const TOTAL_SAMPLE_GUIDES = 24;

export function createSampleGuides(total = TOTAL_SAMPLE_GUIDES) {
  return Array.from({ length: total }, (_, index) => {
    const id = index + 1;
    const paddedId = String(id).padStart(2, "0");

    return {
      id,
      title: `Bài thuyết minh ${paddedId}`,
      subtitle: "Tiêu đề phụ hoặc mốc thời gian",
      description:
        `Đây là nội dung mẫu cho bài thuyết minh số ${paddedId}.\n\n` +
        "Bạn có thể chỉnh sửa tiêu đề, tiêu đề phụ, nội dung, đường dẫn ảnh và audio thông qua backend bí mật.\n\n" +
        "Gợi ý biên tập: viết nội dung thành các đoạn ngắn để dễ đọc trên màn hình điện thoại.",
      imageUrl: `/images/items/${paddedId}.jpg`,
      audioUrl: `/audio/${paddedId}.mp3`,
    };
  });
}
