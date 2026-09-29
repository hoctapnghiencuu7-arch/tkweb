// ==========================================================================
// Basic Blog Interactive JavaScript
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const themeToggle = document.getElementById('themeToggle');
  const btnExplore = document.getElementById('btnExplore');
  const btnSubscribe = document.getElementById('btnSubscribe');
  const btnContact = document.getElementById('btnContact');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const postCards = document.querySelectorAll('.post-card');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalContent = document.getElementById('modalContent');
  const toast = document.getElementById('toast');

  // 1. Dark Mode Toggle
  const savedTheme = localStorage.getItem('blog-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('blog-theme', isDark ? 'dark' : 'light');
    showToast(isDark ? '🌙 Đã chuyển sang giao diện Tối' : '☀️ Đã chuyển sang giao diện Sáng');
  });

  // 2. Action for 3 Special Interactive Buttons
  // Nút 1: Khám phá bài viết -> Cuộn mượt xuống danh sách bài viết
  btnExplore.addEventListener('click', () => {
    const featuredSection = document.getElementById('featured');
    featuredSection.scrollIntoView({ behavior: 'smooth' });
    showToast('🚀 Đang chuyển đến danh sách bài viết!');
  });

  // Nút 2: Đăng ký nhận tin -> Mở modal đăng ký email
  btnSubscribe.addEventListener('click', () => {
    openModal(`
      <h3 style="margin-bottom: 12px; font-size: 1.4rem;">💌 Đăng ký nhận bản tin</h3>
      <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.95rem;">
        Nhận những bài viết mới nhất về lập trình Web, thủ thuật CSS và kinh nghiệm thực chiến vào mỗi sáng thứ Hai!
      </p>
      <form id="subscribeForm" onsubmit="event.preventDefault(); window.handleSubscribe();">
        <input 
          type="email" 
          id="emailInput"
          placeholder="Nhập địa chỉ email của bạn..." 
          required 
          style="width: 100%; padding: 12px 16px; border: 1px solid var(--border-subtle); border-radius: 8px; margin-bottom: 16px; font-family: inherit; font-size: 0.95rem; outline: none; background: var(--bg-primary); color: var(--text-main);"
        >
        <button 
          type="submit" 
          class="btn-lift btn-subscribe" 
          style="width: 100%;"
        >
          Xác nhận đăng ký
        </button>
      </form>
    `);
  });

  // Nút 3: Liên hệ tác giả -> Mở modal liên hệ
  btnContact.addEventListener('click', () => {
    openModal(`
      <h3 style="margin-bottom: 12px; font-size: 1.4rem;">☕ Kết nối với tác giả</h3>
      <p style="color: var(--text-muted); margin-bottom: 16px; font-size: 0.95rem;">
        Rất vui được trao đổi về công nghệ, các dự án hợp tác hoặc đơn giản là một buổi cà phê trò chuyện!
      </p>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
        <div style="padding: 12px; background: var(--bg-primary); border-radius: 8px;">
          📧 <strong>Email:</strong> contact@gocnhoblog.dev
        </div>
        <div style="padding: 12px; background: var(--bg-primary); border-radius: 8px;">
          📍 <strong>Địa chỉ:</strong> Hà Nội / TP. Hồ Chí Minh
        </div>
        <div style="padding: 12px; background: var(--bg-primary); border-radius: 8px;">
          💬 <strong>Telegram / Zalo:</strong> @alexdev_blog
        </div>
      </div>
    `);
  });

  // 3. Category Filter Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');

      postCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'grid';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Modal Functions
  function openModal(htmlContent) {
    modalContent.innerHTML = htmlContent;
    modalOverlay.classList.add('open');
  }

  modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('open');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('open');
    }
  });

  // 5. Toast Notification Function
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  window.showToast = showToast;

  // Global handler for newsletter form submission
  window.handleSubscribe = function() {
    const email = document.getElementById('emailInput').value;
    modalOverlay.classList.remove('open');
    showToast(`🎉 Cảm ơn bạn! Đã đăng ký thành công cho ${email}`);
  };

  // Global handler for reading post modal
  window.openPostModal = function(postId) {
    const articles = {
      'hover-guide': {
        title: 'Cách tạo hiệu ứng Hover mượt mà bằng CSS Transitions và Transform',
        content: `
          <p>Hiệu ứng Hover là một trong những yếu tố vi tương tác (micro-interactions) quan trọng nhất giúp giao diện trở nên sống động và phản hồi tức thì với người dùng.</p>
          <br>
          <h4>1. Công thức nhô lên (Elevation):</h4>
          <pre style="background: var(--bg-primary); padding: 12px; border-radius: 8px; margin: 10px 0; overflow-x: auto;">transform: translateY(-5px);
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);</pre>
          <h4>2. Luôn khai báo transition:</h4>
          <pre style="background: var(--bg-primary); padding: 12px; border-radius: 8px; margin: 10px 0; overflow-x: auto;">transition: transform 0.25s ease, background-color 0.25s ease, color 0.25s ease;</pre>
          <p>Điều này đảm bảo khi chuột rời khỏi nút, các trạng thái sẽ trở về một cách mềm mại thay vì bị giật cục.</p>
        `
      },
      'clean-code': {
        title: '5 Thói quen giúp bạn viết code sạch (Clean Code) mỗi ngày',
        content: `
          <p>Viết code cho máy tính hiểu là điều dễ dàng, nhưng viết code cho con người hiểu mới là nghệ thuật của lập trình viên chuyên nghiệp.</p>
          <br>
          <ul>
            <li><strong>Nguyên tắc 1:</strong> Đặt tên biến và hàm có ý nghĩa rõ ràng.</li>
            <li><strong>Nguyên tắc 2:</strong> Mỗi hàm chỉ làm duy nhất một việc (Single Responsibility).</li>
            <li><strong>Nguyên tắc 3:</strong> Tránh lặp lại code (DRY - Don't Repeat Yourself).</li>
            <li><strong>Nguyên tắc 4:</strong> Giữ cấu trúc file gọn gàng, chia nhỏ components.</li>
            <li><strong>Nguyên tắc 5:</strong> Luôn đọc lại code và refactor trước khi tạo Pull Request.</li>
          </ul>
        `
      },
      'work-life': {
        title: 'Cân bằng giữa công việc lập trình và cuộc sống: Bài học sau 3 năm',
        content: `
          <p>Ngồi nhiều giờ trước màn hình máy tính có thể dẫn đến mỏi mắt, đau lưng và kiệt sức (burnout). Sau 3 năm làm việc full-time trong ngành, đây là những bài học mình đúc kết:</p>
          <br>
          <p>1. Áp dụng quy tắc Pomodoro (25 phút tập trung, 5 phút đứng dậy đi lại).</p>
          <p>2. Tập thể dục ít nhất 30 phút mỗi ngày.</p>
          <p>3. Ngắt thông báo công việc sau 18:30 chiều để dành trọn vẹn thời gian cho bản thân và gia đình.</p>
        `
      }
    };

    const post = articles[postId];
    if (post) {
      openModal(`
        <h3 style="margin-bottom: 14px; font-size: 1.35rem; line-height: 1.35;">${post.title}</h3>
        <div style="font-size: 0.95rem; line-height: 1.7; color: var(--text-muted); max-height: 60vh; overflow-y: auto; padding-right: 6px;">
          ${post.content}
        </div>
      `);
    }
  };
});
