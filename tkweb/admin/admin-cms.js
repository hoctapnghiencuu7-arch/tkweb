document.addEventListener('DOMContentLoaded', () => {
  if (!window.CoreStore) return;

  const data = CoreStore.getData();
  const settings = data.settings || {};

  // 1. Performance Mode
  const perfToggle = document.getElementById('admin-perf-eco-toggle');
  if (perfToggle) {
    perfToggle.checked = settings.perfMode === 'eco';
    perfToggle.addEventListener('change', (e) => {
      const mode = e.target.checked ? 'eco' : 'standard';
      if (window.__setPerformanceMode) {
        window.__setPerformanceMode(mode, true);
      } else {
        const d = CoreStore.getData();
        if (!d.settings) d.settings = {};
        d.settings.perfMode = mode;
        CoreStore.saveData(d);
      }
    });
  }

  // 2. Demo Mode
  const demoToggle = document.getElementById('admin-demo-mode-toggle');
  if (demoToggle) {
    demoToggle.checked = !!settings.demoMode;
    demoToggle.addEventListener('change', (e) => {
      const d = CoreStore.getData();
      if (!d.settings) d.settings = {};
      d.settings.demoMode = e.target.checked;
      CoreStore.saveData(d);
      CoreStore.applySettings(d.settings);
    });
  }

  // 3. Colors
  const colorPrimary = document.getElementById('admin-color-primary');
  const colorBg = document.getElementById('admin-color-bgdark');
  const colorCard = document.getElementById('admin-color-carddark');
  const btnApplyColors = document.getElementById('btn-apply-colors');
  const btnResetColors = document.getElementById('btn-reset-colors');

  if (colorPrimary && settings.colors) {
    colorPrimary.value = settings.colors.primary || '#ff6b00';
    colorBg.value = settings.colors.bgDark || '#0b1325';
    colorCard.value = settings.colors.cardDark || '#152238';
  }

  if (btnApplyColors) {
    btnApplyColors.addEventListener('click', () => {
      const d = CoreStore.getData();
      if (!d.settings) d.settings = {};
      if (!d.settings.colors) d.settings.colors = {};
      d.settings.colors.primary = colorPrimary.value;
      d.settings.colors.bgDark = colorBg.value;
      d.settings.colors.cardDark = colorCard.value;
      CoreStore.saveData(d);
      CoreStore.applySettings(d.settings);
      
      if (window.Swal) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật màu sắc toàn site', showConfirmButton: false, timer: 1500 });
      }
    });
  }

  if (btnResetColors) {
    btnResetColors.addEventListener('click', () => {
      colorPrimary.value = '#ff6b00';
      colorBg.value = '#0b1325';
      colorCard.value = '#152238';
      const d = CoreStore.getData();
      if (!d.settings) d.settings = {};
      if (!d.settings.colors) d.settings.colors = {};
      d.settings.colors.primary = '#ff6b00';
      d.settings.colors.bgDark = '#0b1325';
      d.settings.colors.cardDark = '#152238';
      CoreStore.saveData(d);
      CoreStore.applySettings(d.settings);
      
      if (window.Swal) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã khôi phục màu mặc định', showConfirmButton: false, timer: 1500 });
      }
    });
  }

  // 4. Coupons
  const tbody = document.getElementById('coupon-table-body');
  const btnAdd = document.getElementById('btn-add-coupon');

  function renderCoupons() {
    if (!tbody) return;
    const d = CoreStore.getData();
    const coupons = d.coupons || [];
    tbody.innerHTML = '';
    
    if (coupons.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem; color: var(--text-muted);">Chưa có mã giảm giá nào</td></tr>';
      return;
    }
    
    coupons.forEach((c, idx) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-subtle)';
      tr.innerHTML = \`
        <td style="padding: 0.5rem;"><strong>\${c.code}</strong></td>
        <td style="padding: 0.5rem;">\${c.discountPercent ? c.discountPercent + '%' : (c.discountAmount ? c.discountAmount.toLocaleString() + 'đ' : '0')}</td>
        <td style="padding: 0.5rem;">\${c.discountPercent ? 'Phần trăm' : 'Số tiền'}</td>
        <td style="padding: 0.5rem;"><button class="btn-delete-coupon" data-idx="\${idx}" style="color: #ef4444; background: none; border: none; cursor: pointer;">Xoá</button></td>
      \`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete-coupon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.target.getAttribute('data-idx'));
        const d = CoreStore.getData();
        d.coupons.splice(i, 1);
        CoreStore.saveData(d);
        renderCoupons();
      });
    });
  }

  renderCoupons();

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (window.Swal) {
        Swal.fire({
          title: 'Thêm mã giảm giá mới',
          html: \`
            <input id="swal-code" class="swal2-input" placeholder="Mã Code (vd: SUMMER2026)">
            <input id="swal-pct" class="swal2-input" type="number" placeholder="% Giảm (vd: 10)">
          \`,
          showCancelButton: true,
          confirmButtonText: 'Thêm',
          preConfirm: () => {
            const code = document.getElementById('swal-code').value;
            const pct = document.getElementById('swal-pct').value;
            if (!code) {
              Swal.showValidationMessage('Vui lòng nhập mã code');
              return false;
            }
            return { code: code.toUpperCase(), discountPercent: parseFloat(pct) || 0 };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            const d = CoreStore.getData();
            if (!d.coupons) d.coupons = [];
            d.coupons.push(result.value);
            CoreStore.saveData(d);
            renderCoupons();
          }
        });
      }
    });
  }

  // 5. Generate Random Flight
  const btnGen = document.getElementById('btn-generate-random-flight');
  if (btnGen) {
    btnGen.addEventListener('click', () => {
      if (CoreStore.generateRandomFlight) {
        CoreStore.generateRandomFlight();
        if (window.Swal) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã sinh 1 chuyến bay demo ngẫu nhiên', showConfirmButton: false, timer: 1500 });
        }
      }
    });
  }
});
