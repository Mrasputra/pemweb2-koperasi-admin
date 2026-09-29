/**
 * KSP Amanah Digital — shared UI & data (vanilla JS)
 * Halaman spesifik akan ditambahkan bertahap.
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    anggota: 'ksp_anggota',
    simpanan: 'ksp_simpanan',
    pinjaman: 'ksp_pinjaman',
  };

  /* ——— Mock seed data ——— */
  const MOCK_ANGGOTA = [
    { id: 1, no_anggota: 'AG-0842', nama: 'Siti Aminah', alamat: 'Jl. Melati No. 12, Bandung', no_hp: '081234567890', tgl_gabung: '2019-03-15', status: 'Aktif' },
    { id: 2, no_anggota: 'AG-0843', nama: 'Budi Santoso', alamat: 'Jl. Mawar No. 5, Jakarta Selatan', no_hp: '081987654321', tgl_gabung: '2020-07-22', status: 'Aktif' },
    { id: 3, no_anggota: 'AG-0844', nama: 'Rina Wulandari', alamat: 'Perumahan Green Valley Blok C2', no_hp: '085612345678', tgl_gabung: '2021-01-10', status: 'Aktif' },
    { id: 4, no_anggota: 'AG-0845', nama: 'Ahmad Fauzi', alamat: 'Jl. Sudirman No. 88, Surabaya', no_hp: '081112223333', tgl_gabung: '2018-11-05', status: 'Nonaktif' },
    { id: 5, no_anggota: 'AG-0846', nama: 'Dewi Lestari', alamat: 'Jl. Kenanga 3, Yogyakarta', no_hp: '082134567890', tgl_gabung: '2022-05-18', status: 'Aktif' },
    { id: 6, no_anggota: 'AG-0847', nama: 'Hendra Gunawan', alamat: 'Komplek Permata Indah RT 04', no_hp: '081556677889', tgl_gabung: '2023-02-28', status: 'Aktif' },
    { id: 7, no_anggota: 'AG-0848', nama: 'Maya Sari', alamat: 'Jl. Flamboyan No. 7, Semarang', no_hp: '085811223344', tgl_gabung: '2017-09-12', status: 'Nonaktif' },
    { id: 8, no_anggota: 'AG-0849', nama: 'Joko Widodo', alamat: 'Jl. Merdeka 45, Solo', no_hp: '081998877665', tgl_gabung: '2024-01-03', status: 'Aktif' },
  ];

  const MOCK_SIMPANAN = [
    { id: 1, id_anggota: 1, jenis: 'Wajib', jumlah: 150000, tanggal: '2024-10-01T09:30:00' },
    { id: 2, id_anggota: 2, jenis: 'Sukarela', jumlah: 500000, tanggal: '2024-10-02T14:15:00' },
    { id: 3, id_anggota: 3, jenis: 'Pokok', jumlah: 100000, tanggal: '2024-10-03T10:00:00' },
    { id: 4, id_anggota: 5, jenis: 'Wajib', jumlah: 150000, tanggal: '2024-10-04T11:20:00' },
    { id: 5, id_anggota: 8, jenis: 'Sukarela', jumlah: 250000, tanggal: '2024-10-05T16:45:00' },
  ];

  const MOCK_PINJAMAN = [
    { id: 1, id_anggota: 2, jumlah_pinjam: 15000000, tenor: 24, tgl_pinjam: '2023-06-01', sisa_angsuran: 8750000, status: 'Lancar' },
    { id: 2, id_anggota: 4, jumlah_pinjam: 8000000, tenor: 12, tgl_pinjam: '2024-01-15', sisa_angsuran: 3200000, status: 'Menunggak' },
    { id: 3, id_anggota: 6, jumlah_pinjam: 25000000, tenor: 36, tgl_pinjam: '2022-03-10', sisa_angsuran: 0, status: 'Lunas' },
    { id: 4, id_anggota: 1, jumlah_pinjam: 5000000, tenor: 10, tgl_pinjam: '2024-08-20', sisa_angsuran: 3500000, status: 'Lancar' },
  ];

  function initStorage(key, seed) {
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, JSON.stringify(seed));
    }
  }

  function getData(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  function setData(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  /* ——— Format helpers ——— */
  function formatRupiah(n) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  }

  function formatDateId(iso) {
    if (!iso) return '—';
    const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function initials(name) {
    return (name || '?')
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  /* ——— Toast ——— */
  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast toast--' + (type || 'success');
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 3200);
  }

  /* ——— Confirm modal ——— */
  let confirmResolve = null;

  function openConfirm(title, text) {
    return new Promise(function (resolve) {
      const backdrop = document.getElementById('confirmModal');
      const titleEl = document.getElementById('confirmModalTitle');
      const textEl = document.getElementById('confirmModalText');
      if (!backdrop) {
        resolve(window.confirm(text || title));
        return;
      }
      confirmResolve = resolve;
      if (titleEl) titleEl.textContent = title || 'Konfirmasi';
      if (textEl) textEl.textContent = text || 'Apakah Anda yakin?';
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
    });
  }

  function closeConfirm(result) {
    const backdrop = document.getElementById('confirmModal');
    if (backdrop) {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    if (confirmResolve) {
      confirmResolve(result);
      confirmResolve = null;
    }
  }

  /* ——— Sidebar mobile & nav groups ——— */
  function initLayout() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');

    function openSidebar() {
      sidebar?.classList.add('is-open');
      overlay?.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar?.classList.remove('is-open');
      overlay?.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    menuToggle?.addEventListener('click', function () {
      if (sidebar?.classList.contains('is-open')) closeSidebar();
      else openSidebar();
    });

    overlay?.addEventListener('click', closeSidebar);

    document.querySelectorAll('.nav__group-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const group = btn.closest('.nav__group');
        const open = group?.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    document.querySelectorAll('.nav__link, .nav__sublink').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 900) closeSidebar();
      });
    });

    document.getElementById('confirmModalCancel')?.addEventListener('click', function () {
      closeConfirm(false);
    });
    document.getElementById('confirmModalOk')?.addEventListener('click', function () {
      closeConfirm(true);
    });
    document.getElementById('confirmModal')?.addEventListener('click', function (e) {
      if (e.target.id === 'confirmModal') closeConfirm(false);
    });

    document.getElementById('btnUnduhLaporan')?.addEventListener('click', function () {
      window.location.href = 'laporan.html';
    });

    highlightNav();
    updateNavAnggotaCount();
  }

  function highlightNav() {
    const page = document.body.dataset.page;
    if (!page) return;

    document.querySelectorAll('.nav__link, .nav__sublink').forEach(function (el) {
      el.classList.remove('is-active');
    });

    const active = document.querySelector('[data-nav="' + page + '"]');
    if (active) {
      active.classList.add('is-active');
      const group = active.closest('.nav__group');
      if (group) {
        group.classList.add('is-open');
        const toggle = group.querySelector('.nav__group-toggle');
        toggle?.setAttribute('aria-expanded', 'true');
      }
    }
  }

  function updateNavAnggotaCount() {
    const el = document.getElementById('navAnggotaCount');
    if (!el) return;
    const count = getData(STORAGE_KEYS.anggota).length;
    el.textContent = count.toLocaleString('id-ID');
  }

  /* ——— Init ——— */
  function findAnggota(id) {
    return getData(STORAGE_KEYS.anggota).find(function (a) {
      return a.id === Number(id);
    });
  }

  function nextAnggotaId(list) {
    return list.reduce(function (max, a) {
      return Math.max(max, a.id);
    }, 0) + 1;
  }

  function statusBadge(status) {
    var map = {
      Aktif: 'success',
      Nonaktif: 'muted',
      Lancar: 'cyan',
      Menunggak: 'danger',
      Lunas: 'success',
      Selesai: 'success',
      Tertunda: 'warning',
    };
    var cls = map[status] || 'muted';
    var dot = cls === 'success' || cls === 'muted' ? '<span class="badge__dot"></span>' : '';
    return '<span class="badge badge--' + cls + '">' + dot + status + '</span>';
  }

  /* ——— Dashboard ——— */
  function initDashboard() {
    var kpiEl = document.getElementById('dashboardKpi');
    if (!kpiEl) return;

    var anggota = getData(STORAGE_KEYS.anggota);
    var simpanan = getData(STORAGE_KEYS.simpanan);
    var pinjaman = getData(STORAGE_KEYS.pinjaman);

    var totalSimpanan = simpanan.reduce(function (s, x) {
      return s + x.jumlah;
    }, 0);
    var pinjamanAktif = pinjaman.filter(function (p) {
      return p.status !== 'Lunas';
    });
    var totalPinjaman = pinjamanAktif.reduce(function (s, p) {
      return s + p.sisa_angsuran;
    }, 0);
    var tunggak = pinjaman.filter(function (p) {
      return p.status === 'Menunggak';
    });
    var totalTunggak = tunggak.reduce(function (s, p) {
      return s + p.sisa_angsuran;
    }, 0);
    var rasio = totalPinjaman ? ((totalTunggak / totalPinjaman) * 100).toFixed(1) : '0';

    kpiEl.innerHTML =
      kpiCard('Total Anggota', anggota.length.toLocaleString('id-ID') + ' Orang', '+12 Anggota Baru', 'up', 'cyan', 'users') +
      kpiCard('Total Simpanan Kas', formatRupiah(totalSimpanan), 'Akumulasi transaksi simpanan', '', 'green', 'wallet') +
      kpiCard('Pinjaman Berjalan', formatRupiah(totalPinjaman), pinjamanAktif.length + ' pinjaman aktif', '', 'gold', 'loan') +
      kpiCard('Tunggakan (NPL)', formatRupiah(totalTunggak), 'Rasio ' + rasio + '%', 'down', 'red', 'alert', true);

    renderRecentTransactions(anggota, simpanan, pinjaman);
    renderCharts(simpanan, pinjaman, totalSimpanan, simpanan.length);
  }

  function kpiSvg(kind) {
    var icons = {
      users:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      wallet:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>',
      loan:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      alert:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };
    return icons[kind] || icons.users;
  }

  function kpiCard(label, value, sub, trend, iconType, iconName, dangerValue) {
    var trendHtml = '';
    if (trend === 'up') trendHtml = '<div class="kpi-card__trend kpi-card__trend--up">' + sub + '</div>';
    else if (trend === 'down') trendHtml = '<div class="kpi-card__trend kpi-card__trend--down">' + sub + '</div>';
    else trendHtml = '<div class="kpi-card__sub">' + sub + '</div>';
    var valClass = dangerValue ? ' kpi-card__value--danger' : '';
    return (
      '<article class="glass-panel kpi-card">' +
      '<div class="kpi-card__label">' +
      label +
      '</div>' +
      '<div class="kpi-card__value' +
      valClass +
      '">' +
      value +
      '</div>' +
      trendHtml +
      '<div class="kpi-card__icon kpi-card__icon--' +
      iconType +
      '">' +
      kpiSvg(iconName) +
      '</div></article>'
    );
  }

  function renderRecentTransactions(anggota, simpanan, pinjaman) {
    var tbody = document.getElementById('dashboardRecentTx');
    if (!tbody) return;
    var rows = simpanan
      .slice()
      .sort(function (a, b) {
        return new Date(b.tanggal) - new Date(a.tanggal);
      })
      .slice(0, 6)
      .map(function (s) {
        var ag = anggota.find(function (a) {
          return a.id === s.id_anggota;
        });
        return (
          '<tr><td><span class="data-table__link">TRX-S' +
          String(s.id).padStart(4, '0') +
          '</span></td><td><div class="cell-user"><div class="avatar">' +
          initials(ag?.nama) +
          '</div><div><div class="cell-user__name">' +
          (ag?.nama || '—') +
          '</div></div></div></td><td>Simpanan ' +
          s.jenis +
          '</td><td style="color:var(--success)">' +
          formatRupiah(s.jumlah) +
          '</td><td>' +
          formatDateId(s.tanggal) +
          '</td><td>' +
          statusBadge('Selesai') +
          '</td></tr>'
        );
      });
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6">Belum ada transaksi.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.join('');
  }

  function renderCharts(simpanan, pinjaman, totalSimpanan, txCount) {
    var months = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
    var wajib = [42, 48, 51, 55, 58, 62].map(function (v) {
      return v * 1e6;
    });
    var sukarela = [28, 30, 33, 36, 38, 41].map(function (v) {
      return v * 1e6;
    });

    var avgEl = document.getElementById('statAvg');
    var inflowEl = document.getElementById('statInflow');
    var txEl = document.getElementById('statTx');
    if (avgEl) avgEl.textContent = formatRupiah(Math.round(totalSimpanan / Math.max(simpanan.length, 1)));
    if (inflowEl) inflowEl.textContent = formatRupiah(simpanan[0]?.jumlah || 0);
    if (txEl) txEl.textContent = txCount + ' transaksi';

    var lineCanvas = document.getElementById('chartSimpanan');
    if (lineCanvas && typeof Chart !== 'undefined') {
      new Chart(lineCanvas, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Wajib',
              data: wajib,
              borderColor: '#00d4ff',
              backgroundColor: 'rgba(0, 212, 255, 0.12)',
              fill: true,
              tension: 0.35,
            },
            {
              label: 'Sukarela',
              data: sukarela,
              borderColor: '#60a5fa',
              backgroundColor: 'rgba(96, 165, 250, 0.08)',
              fill: true,
              tension: 0.35,
            },
          ],
        },
        options: chartDarkOptions(),
      });
    }

    var lancar = pinjaman.filter(function (p) {
      return p.status === 'Lancar';
    }).length;
    var menunggak = pinjaman.filter(function (p) {
      return p.status === 'Menunggak';
    }).length;
    var lunas = pinjaman.filter(function (p) {
      return p.status === 'Lunas';
    }).length;

    var donutCanvas = document.getElementById('chartPinjaman');
    if (donutCanvas && typeof Chart !== 'undefined') {
      new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Lancar', 'Menunggak', 'Lunas'],
          datasets: [
            {
              data: [lancar, menunggak, lunas],
              backgroundColor: ['#00d4ff', '#ef4444', '#4ade80'],
              borderWidth: 0,
            },
          ],
        },
        options: Object.assign({}, chartDarkOptions(), {
          cutout: '68%',
          plugins: {
            legend: { display: false },
          },
        }),
      });
    }

    var legend = document.getElementById('donutLegend');
    if (legend) {
      legend.innerHTML = [
        { label: 'Kolektibilitas Lancar', color: '#22d3ee', val: lancar },
        { label: 'Menunggak (Kol 2–4)', color: '#ef4444', val: menunggak },
        { label: 'Lunas', color: '#4ade80', val: lunas },
      ]
        .map(function (item) {
          return (
            '<div class="legend-item"><span class="legend-item__dot" style="background:' +
            item.color +
            '"></span>' +
            item.label +
            '<span class="legend-item__value">' +
            item.val +
            '</span></div>'
          );
        })
        .join('');
    }
  }

  function chartDarkOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
        y: {
          ticks: {
            color: '#94a3b8',
            callback: function (v) {
              return (v / 1e6).toFixed(0) + ' jt';
            },
          },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
      },
      plugins: {
        legend: {
          labels: { color: '#cbd5e1' },
        },
      },
    };
  }

  /* ——— Anggota list ——— */
  var anggotaState = { page: 1, perPage: 8, search: '', status: '' };

  function initAnggotaPage() {
    var tbody = document.getElementById('anggotaTableBody');
    if (!tbody) return;

    renderAnggotaKpi();
    renderAnggotaTable();

    document.getElementById('anggotaSearch')?.addEventListener('input', function (e) {
      anggotaState.search = e.target.value.trim().toLowerCase();
      anggotaState.page = 1;
      renderAnggotaTable();
    });
    document.getElementById('anggotaFilterStatus')?.addEventListener('change', function (e) {
      anggotaState.status = e.target.value;
      anggotaState.page = 1;
      renderAnggotaTable();
    });

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-delete-id]');
      if (!btn) return;
      var id = btn.getAttribute('data-delete-id');
      var row = findAnggota(id);
      openConfirm('Hapus Anggota', 'Hapus data "' + (row?.nama || '') + '"? Tindakan ini tidak dapat dibatalkan.').then(function (ok) {
        if (!ok) return;
        var list = getData(STORAGE_KEYS.anggota).filter(function (a) {
          return a.id !== Number(id);
        });
        setData(STORAGE_KEYS.anggota, list);
        showToast('Anggota berhasil dihapus.', 'success');
        updateNavAnggotaCount();
        renderAnggotaKpi();
        renderAnggotaTable();
      });
    });

    document.getElementById('anggotaPagination')?.addEventListener('click', function (e) {
      var pageBtn = e.target.closest('[data-page]');
      if (!pageBtn) return;
      anggotaState.page = Number(pageBtn.getAttribute('data-page'));
      renderAnggotaTable();
    });
  }

  function filterAnggotaList() {
    return getData(STORAGE_KEYS.anggota).filter(function (a) {
      var matchSearch =
        !anggotaState.search ||
        a.nama.toLowerCase().includes(anggotaState.search) ||
        a.no_anggota.toLowerCase().includes(anggotaState.search);
      var matchStatus = !anggotaState.status || a.status === anggotaState.status;
      return matchSearch && matchStatus;
    });
  }

  function renderAnggotaKpi() {
    var el = document.getElementById('anggotaKpi');
    if (!el) return;
    var all = getData(STORAGE_KEYS.anggota);
    var aktif = all.filter(function (a) {
      return a.status === 'Aktif';
    }).length;
    var non = all.length - aktif;
    var pct = all.length ? ((aktif / all.length) * 100).toFixed(2) : '0';
    el.innerHTML =
      kpiCard('Total Anggota Terdaftar', all.length.toLocaleString('id-ID') + ' Orang', '+18 anggota bulan ini', 'up', 'cyan', '') +
      kpiCard('Anggota Aktif', aktif.toLocaleString('id-ID') + ' Orang', pct + '% dari total', '', 'green', '') +
      kpiCard('Anggota Nonaktif', non.toLocaleString('id-ID') + ' Orang', 'Belum menyetor > 6 bulan', '', 'red', '', false);
  }

  function renderAnggotaTable() {
    var tbody = document.getElementById('anggotaTableBody');
    var info = document.getElementById('anggotaPaginationInfo');
    var pag = document.getElementById('anggotaPagination');
    if (!tbody) return;

    var filtered = filterAnggotaList();
    var total = filtered.length;
    var start = (anggotaState.page - 1) * anggotaState.perPage;
    var pageItems = filtered.slice(start, start + anggotaState.perPage);

    tbody.innerHTML = pageItems
      .map(function (a) {
        return (
          '<tr>' +
          '<td><a class="data-table__link" href="form-anggota.html?id=' +
          a.id +
          '">' +
          a.no_anggota +
          '</a></td>' +
          '<td><div class="cell-user"><div class="avatar">' +
          initials(a.nama) +
          '</div><div><div class="cell-user__name">' +
          a.nama +
          '</div></div></div></td>' +
          '<td>' +
          a.alamat +
          '</td>' +
          '<td>' +
          a.no_hp +
          '</td>' +
          '<td>' +
          formatDateId(a.tgl_gabung) +
          '</td>' +
          '<td>' +
          statusBadge(a.status) +
          '</td>' +
          '<td class="no-print"><div class="table-actions">' +
          '<a class="btn btn--ghost btn--sm btn--icon" href="form-anggota.html?id=' +
          a.id +
          '" title="Edit"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></a>' +
          '<button type="button" class="btn btn--danger btn--sm btn--icon" data-delete-id="' +
          a.id +
          '" title="Hapus"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
          '</div></td></tr>'
        );
      })
      .join('');

    if (!pageItems.length) {
      tbody.innerHTML = '<tr><td colspan="7">Tidak ada data ditemukan.</td></tr>';
    }

    if (info) {
      var end = Math.min(start + anggotaState.perPage, total);
      info.textContent =
        total === 0
          ? 'Tidak ada anggota'
          : 'Menampilkan ' + (start + 1) + '–' + end + ' dari ' + total.toLocaleString('id-ID') + ' anggota';
    }

    if (pag) {
      var pages = Math.ceil(total / anggotaState.perPage) || 1;
      var html = '';
      for (var i = 1; i <= Math.min(pages, 5); i++) {
        html +=
          '<button type="button" class="pagination__page' +
          (i === anggotaState.page ? ' is-active' : '') +
          '" data-page="' +
          i +
          '">' +
          i +
          '</button>';
      }
      if (pages > 5) html += '<span style="padding:0 0.25rem">…</span><button type="button" class="pagination__page" data-page="' + pages + '">' + pages + '</button>';
      pag.innerHTML = html;
    }
  }

  /* ——— Form anggota ——— */
  function initFormAnggota() {
    var form = document.getElementById('formAnggota');
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var editId = params.get('id');
    if (editId) {
      var row = findAnggota(editId);
      if (row) {
        document.getElementById('formPageTitle').textContent = 'Edit Anggota';
        document.getElementById('formBreadcrumb').textContent = 'Edit Anggota';
        document.getElementById('anggotaId').value = row.id;
        document.getElementById('no_anggota').value = row.no_anggota;
        document.getElementById('nama').value = row.nama;
        document.getElementById('alamat').value = row.alamat;
        document.getElementById('no_hp').value = row.no_hp;
        document.getElementById('tgl_gabung').value = row.tgl_gabung;
        document.getElementById('status').value = row.status;
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateAnggotaForm()) return;

      var list = getData(STORAGE_KEYS.anggota);
      var payload = {
        id: Number(document.getElementById('anggotaId').value) || nextAnggotaId(list),
        no_anggota: document.getElementById('no_anggota').value.trim(),
        nama: document.getElementById('nama').value.trim(),
        alamat: document.getElementById('alamat').value.trim(),
        no_hp: document.getElementById('no_hp').value.trim(),
        tgl_gabung: document.getElementById('tgl_gabung').value,
        status: document.getElementById('status').value,
      };

      var idx = list.findIndex(function (a) {
        return a.id === payload.id;
      });
      if (idx >= 0) list[idx] = payload;
      else list.push(payload);

      setData(STORAGE_KEYS.anggota, list);
      showToast(editId ? 'Data anggota diperbarui.' : 'Anggota baru ditambahkan.', 'success');
      setTimeout(function () {
        window.location.href = 'anggota.html';
      }, 600);
    });
  }

  function setFieldError(name, msg) {
    var input = document.getElementById(name);
    var err = document.querySelector('[data-error="' + name + '"]');
    if (input) input.classList.toggle('is-invalid', !!msg);
    if (err) err.textContent = msg || '';
  }

  function validateAnggotaForm() {
    var valid = true;
    var nama = document.getElementById('nama').value.trim();
    var alamat = document.getElementById('alamat').value.trim();
    var no_hp = document.getElementById('no_hp').value.trim();
    var tgl = document.getElementById('tgl_gabung').value;
    var status = document.getElementById('status').value;
    var no_anggota = document.getElementById('no_anggota').value.trim();

    setFieldError('nama', '');
    setFieldError('alamat', '');
    setFieldError('no_hp', '');
    setFieldError('tgl_gabung', '');
    setFieldError('status', '');
    setFieldError('no_anggota', '');

    if (nama.length < 3) {
      setFieldError('nama', 'Nama minimal 3 karakter.');
      valid = false;
    }
    if (alamat.length < 10) {
      setFieldError('alamat', 'Alamat minimal 10 karakter.');
      valid = false;
    }
    if (!/^08\d{8,11}$/.test(no_hp)) {
      setFieldError('no_hp', 'Format: 08 diikuti 8–11 digit (contoh: 081234567890).');
      valid = false;
    }
    if (!tgl) {
      setFieldError('tgl_gabung', 'Tanggal bergabung wajib diisi.');
      valid = false;
    }
    if (!status) {
      setFieldError('status', 'Status wajib dipilih.');
      valid = false;
    }
    if (!no_anggota) {
      setFieldError('no_anggota', 'No. anggota wajib diisi.');
      valid = false;
    }
    return valid;
  }

  /* ——— Simpanan & Pinjaman tables ——— */
  function initSimpananPage() {
    var tbody = document.getElementById('simpananTableBody');
    if (!tbody) return;
    var anggota = getData(STORAGE_KEYS.anggota);
    tbody.innerHTML = getData(STORAGE_KEYS.simpanan)
      .map(function (s) {
        var ag = anggota.find(function (a) {
          return a.id === s.id_anggota;
        });
        return (
          '<tr><td>SP-' +
          String(s.id).padStart(4, '0') +
          '</td><td>' +
          (ag?.nama || '—') +
          ' <span class="cell-user__sub">(' +
          (ag?.no_anggota || '') +
          ')</span></td><td>' +
          s.jenis +
          '</td><td style="color:var(--success)">' +
          formatRupiah(s.jumlah) +
          '</td><td>' +
          formatDateId(s.tanggal) +
          '</td><td>' +
          statusBadge('Selesai') +
          '</td></tr>'
        );
      })
      .join('');
  }

  function initPinjamanPage() {
    var tbody = document.getElementById('pinjamanTableBody');
    if (!tbody) return;
    var anggota = getData(STORAGE_KEYS.anggota);
    tbody.innerHTML = getData(STORAGE_KEYS.pinjaman)
      .map(function (p) {
        var ag = anggota.find(function (a) {
          return a.id === p.id_anggota;
        });
        return (
          '<tr><td>PJ-' +
          String(p.id).padStart(4, '0') +
          '</td><td>' +
          (ag?.nama || '—') +
          '</td><td>' +
          formatRupiah(p.jumlah_pinjam) +
          '</td><td>' +
          p.tenor +
          ' bln</td><td>' +
          formatDateId(p.tgl_pinjam) +
          '</td><td>' +
          formatRupiah(p.sisa_angsuran) +
          '</td><td>' +
          statusBadge(p.status) +
          '</td></tr>'
        );
      })
      .join('');
  }

  /* ——— Laporan ——— */
  function initLaporanPage() {
    if (!document.getElementById('laporanKpi')) return;

    var anggota = getData(STORAGE_KEYS.anggota);
    var simpanan = getData(STORAGE_KEYS.simpanan);
    var pinjaman = getData(STORAGE_KEYS.pinjaman);
    var periode = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    var periodeEl = document.getElementById('laporanPeriodePrint');
    if (periodeEl) periodeEl.textContent = periode;

    var totalSimpanan = simpanan.reduce(function (s, x) {
      return s + x.jumlah;
    }, 0);
    var totalPinjaman = pinjaman.reduce(function (s, p) {
      return s + p.sisa_angsuran;
    }, 0);
    var tunggak = pinjaman
      .filter(function (p) {
        return p.status === 'Menunggak';
      })
      .reduce(function (s, p) {
        return s + p.sisa_angsuran;
      }, 0);

    document.getElementById('laporanKpi').innerHTML =
      kpiCard('Periode', periode, 'Rekap operasional koperasi', '', 'cyan', '') +
      kpiCard('Total Anggota', String(anggota.length), 'Terdaftar aktif/nonaktif', '', 'green', '') +
      kpiCard('Total Simpanan', formatRupiah(totalSimpanan), simpanan.length + ' transaksi', '', 'green', '') +
      kpiCard('Tunggakan', formatRupiah(tunggak), 'Dari portofolio pinjaman', 'down', 'red', '', true);

    var summaryBody = document.querySelector('#laporanSummaryTable tbody');
    if (summaryBody) {
      summaryBody.innerHTML =
        '<tr><td>Total Pinjaman Berjalan</td><td>' +
        formatRupiah(totalPinjaman) +
        '</td><td>Sisa pokok + bunga</td></tr>' +
        '<tr><td>Anggota Aktif</td><td>' +
        anggota.filter(function (a) {
          return a.status === 'Aktif';
        }).length +
        '</td><td>Status partisipatif</td></tr>' +
        '<tr><td>Rasio Tunggakan</td><td>' +
        (totalPinjaman ? ((tunggak / totalPinjaman) * 100).toFixed(1) : 0) +
        '%</td><td>Indikator risiko</td></tr>';
    }

    var pjBody = document.getElementById('laporanPinjamanBody');
    if (pjBody) {
      pjBody.innerHTML = pinjaman
        .map(function (p) {
          var ag = anggota.find(function (a) {
            return a.id === p.id_anggota;
          });
          return (
            '<tr><td>' +
            (ag?.nama || '—') +
            '</td><td>' +
            formatRupiah(p.jumlah_pinjam) +
            '</td><td>' +
            formatRupiah(p.sisa_angsuran) +
            '</td><td>' +
            statusBadge(p.status) +
            '</td></tr>'
          );
        })
        .join('');
    }

    document.getElementById('btnPrintLaporan')?.addEventListener('click', function () {
      window.print();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initStorage(STORAGE_KEYS.anggota, MOCK_ANGGOTA);
    initStorage(STORAGE_KEYS.simpanan, MOCK_SIMPANAN);
    initStorage(STORAGE_KEYS.pinjaman, MOCK_PINJAMAN);
    initLayout();
    initDashboard();
    initAnggotaPage();
    initFormAnggota();
    initSimpananPage();
    initPinjamanPage();
    initLaporanPage();
  });

  window.KSP = {
    STORAGE_KEYS,
    getData,
    setData,
    formatRupiah,
    formatDateId,
    initials,
    showToast,
    openConfirm,
    updateNavAnggotaCount,
    MOCK_ANGGOTA,
  };
})();
