"use client";

import { useEffect, useMemo, useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import Footer from "@/components/footer";
import "../../tongquan/page.css";
import "./page.css";
import { useAuth } from "@/lib/auth-context";
import {
  getInstructorBalance,
  getAvailableBalanceSummary,
  getPendingBalanceSummary,
  createPayoutRequest,
  getPayoutHistory,
  addBankAccount,
  getBankAccounts,
} from "../../lib/instructorApi";

export default function RutTienPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState("");
  const [requests, setRequests] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newAccountHolder, setNewAccountHolder] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");

  const mapPayoutToItem = (p) => {
    const notes = String(p?.Notes ?? p?.notes ?? "");
    // Parse "Rút về: <bank> | Chủ TK: <holder> | Số: <account>"
    const bankMatch = notes.match(/Rút\s*về:\s*([^|]+)/i);
    const accMatch = notes.match(/Số:\s*([^|]+)/i);
    const bank = bankMatch ? bankMatch[1].trim() : (p?.Method ?? p?.method ?? "");
    const acc = accMatch ? accMatch[1].trim() : "";

    const id = p?.PayoutId ?? p?.payoutId ?? p?.id ?? Date.now();
    const method = bank || "—";
    const masked = acc ? `${bank ? bank + " " : ""}${"****" + String(acc).slice(-4)}` : (bank ? bank : "—");

    return {
      id,
      method,
      masked,
      status: p?.Status ?? p?.status ?? "",
      createdAt: p?.RequestedAt ?? p?.requestedAt ?? new Date().toISOString(),
      txnId: String(id ?? ""),
      value: Number(p?.Amount ?? p?.amount ?? 0),
      fee: Number(p?.PlatformFee ?? p?.platformFee ?? 0),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!token) throw new Error("Chưa đăng nhập hoặc thiếu token");

        const [balanceSummary, pending, history, accList] = await Promise.all([
          getAvailableBalanceSummary(token),
          getPendingBalanceSummary(token),
          getPayoutHistory(token),
          getBankAccounts(token),
        ]);

        // Dùng số dư khả dụng chuẩn: totalEarnings - totalWithdrawn - totalPendingWithdraw (Amount)
        setAvailableBalance(balanceSummary?.AvailableBalance ?? balanceSummary?.availableBalance ?? 0);
        // Đồng bộ số dư đang chờ: pendingOrders + pendingPayouts (Amount)
        const pendingTotal = pending?.totalPending ?? (Number(pending?.pendingOrders || 0) + Number(pending?.pendingPayouts || 0));
        setPendingBalance(pendingTotal || 0);
        const list = Array.isArray(history) ? history.map(mapPayoutToItem) : [];
        setRequests(list);
        setAccounts(Array.isArray(accList) ? accList : []);
      } catch (e) {
        console.error("Load rút tiền error:", e);
        setError(e?.message || "Không thể tải dữ liệu rút tiền");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const quickSet = (v) => setAmount(v);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !account) return;
    try {
      if (!token) {
        alert("Bạn chưa đăng nhập hoặc thiếu token.");
        return;
      }
      // Parse selected account value in format "bankName|accountNumber"
      const [selectedBank, selectedNumber] = String(account).split("|");
      const selected = accounts.find((a) => a.bankName === selectedBank && a.accountNumber === selectedNumber) || null;
      const notes = selected
        ? `Rút về: ${selected.bankName} | Chủ TK: ${selected.accountHolder} | Số: ${selected.accountNumber}`
        : account;
      const res = await createPayoutRequest({ amount, method: selected?.bankName || selectedBank || account, notes }, token);
      const created = res?.payout ? mapPayoutToItem(res.payout) : null;
      if (created) {
        setRequests((prev) => [created, ...prev]);
      }
      setAmount(0);
      setAccount("");
      const msg = res?.message || "Đã gửi yêu cầu rút tiền";
      alert(msg);
    } catch (err) {
      console.error("Create payout error:", err);
      alert(err?.message || "Không thể tạo yêu cầu rút tiền");
    }
  };

  // ----------------- Filter state & helpers -----------------
  const [filters, setFilters] = useState({
    method: "",
    status: "",
    from: "",
    to: "",
    min: "",
    max: "",
    q: "",
  });
  const [filterKey, setFilterKey] = useState("method");
  const [filterInput, setFilterInput] = useState("");
  const filterOptions = [
    { value: "method", label: "Phương thức" },
    { value: "status", label: "Trạng thái" },
    { value: "createdAt", label: "Ngày yêu cầu" },
    { value: "txnId", label: "Mã giao dịch" },
    { value: "account", label: "Tài khoản" },
    { value: "amount", label: "Số tiền tối thiểu" },
  ];

  const parseDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  // Hỗ trợ nhập ngày linh hoạt (giống phần Ngày đăng ký của học viên)
  // Cho phép: yyyy, MM/yyyy, dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd
  const parseFlexibleDateInput = (input) => {
    if (!input) return null;
    const v = input.trim();
    // yyyy
    const yearOnly = v.match(/^\d{4}$/);
    if (yearOnly) {
      const y = Number(v);
      const from = new Date(y, 0, 1);
      const to = new Date(y, 11, 31, 23, 59, 59, 999);
      return { from, to };
    }
    // MM/yyyy
    const monthYear = v.match(/^(0?[1-9]|1[0-2])\/(\d{4})$/);
    if (monthYear) {
      const m = Number(monthYear[1]) - 1;
      const y = Number(monthYear[2]);
      const from = new Date(y, m, 1, 0, 0, 0, 0);
      const to = new Date(y, m + 1, 0, 23, 59, 59, 999);
      return { from, to };
    }
    // dd/MM/yyyy
    const dayMonthYearSlash = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dayMonthYearSlash) {
      const d = Number(dayMonthYearSlash[1]);
      const m = Number(dayMonthYearSlash[2]) - 1;
      const y = Number(dayMonthYearSlash[3]);
      const from = new Date(y, m, d, 0, 0, 0, 0);
      const to = new Date(y, m, d, 23, 59, 59, 999);
      return { from, to };
    }
    // dd-MM-yyyy
    const dayMonthYearDash = v.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dayMonthYearDash) {
      const d = Number(dayMonthYearDash[1]);
      const m = Number(dayMonthYearDash[2]) - 1;
      const y = Number(dayMonthYearDash[3]);
      const from = new Date(y, m, d, 0, 0, 0, 0);
      const to = new Date(y, m, d, 23, 59, 59, 999);
      return { from, to };
    }
    // yyyy-MM-dd (ISO short)
    const isoShort = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoShort) {
      const y = Number(isoShort[1]);
      const m = Number(isoShort[2]) - 1;
      const d = Number(isoShort[3]);
      const from = new Date(y, m, d, 0, 0, 0, 0);
      const to = new Date(y, m, d, 23, 59, 59, 999);
      return { from, to };
    }
    return null;
  };

  const displayDate = (v) => {
    if (!v) return "";
    if (typeof v === "string" && v.includes("T")) {
      return new Date(v).toLocaleString("vi-VN");
    }
    return v; // legacy formatted string
  };

  const filteredRequests = useMemo(() => {
    const from = parseDate(filters.from);
    const to = parseDate(filters.to);
    const min = filters.min ? Number(filters.min) : null;
    const max = filters.max ? Number(filters.max) : null;
    const q = filters.q.trim().toLowerCase();

    return requests.filter((r) => {
      // method/status
      if (filters.method && r.method !== filters.method) return false;
      if (filters.status && r.status !== filters.status) return false;

      // amount
      if (min !== null && r.value < min) return false;
      if (max !== null && r.value > max) return false;

      // date
      let created;
      if (typeof r.createdAt === "string") {
        created = r.createdAt.includes("T")
          ? new Date(r.createdAt)
          : new Date(r.createdAt.replace(" ", "T"));
      } else {
        created = new Date(r.createdAt);
      }
      if (from && created < new Date(from.setHours(0,0,0,0))) return false;
      if (to && created > new Date(to.setHours(23,59,59,999))) return false;

      // query: txnId or masked
      if (q && !(r.txnId.toLowerCase().includes(q) || r.masked.toLowerCase().includes(q))) return false;

      return true;
    });
  }, [requests, filters]);

  const resetFilters = () => setFilters({ method: "", status: "", from: "", to: "", min: "", max: "", q: "" });

  // Simple filter bar actions (similar to student page)
  const applySimpleFilter = () => {
    const cleared = { method: "", status: "", from: "", to: "", min: "", max: "", q: "" };
    switch (filterKey) {
      case "method":
        cleared.method = filterInput.trim();
        break;
      case "status":
        cleared.status = filterInput.trim();
        break;
      case "createdAt":
        // Hỗ trợ các định dạng: yyyy, MM/yyyy, dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd
        {
          const range = parseFlexibleDateInput(filterInput.trim());
          if (!range) {
            alert("Ngày yêu cầu không hợp lệ. Định dạng: yyyy, MM/yyyy, dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd");
            break;
          }
          cleared.from = range.from;
          cleared.to = range.to;
        }
        break;
      case "txnId":
        cleared.q = filterInput.trim();
        break;
      case "account":
        cleared.q = filterInput.trim();
        break;
      case "amount":
        cleared.min = filterInput.trim();
        break;
      default:
        break;
    }
    setFilters(cleared);
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Phương thức", "Tài khoản", "Trạng thái", "Thời gian", "Mã GD", "Số tiền", "Phí", "Thực nhận"],
      ...filteredRequests.map((r) => {
        const net = r.value - r.fee;
        return [
          r.id,
          r.method,
          r.masked,
          r.status,
          displayDate(r.createdAt),
          r.txnId,
          r.value,
          r.fee,
          net,
        ];
      }),
    ];
    const csv = rows
      .map((row) => row
        .map((cell) => {
          const s = String(cell ?? "");
          const needsQuote = s.includes(",") || s.includes("\n") || s.includes("\"");
          const escaped = s.replace(/\"/g, '""');
          return needsQuote ? `"${escaped}"` : escaped;
        })
        .join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lich-su-rut-tien.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maskAcc = (num) => {
    const s = String(num || "");
    const last4 = s.slice(-4) || "0000";
    return `****${last4}`;
  };

  const handleAddAccount = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!newBankName || !newAccountHolder || !newAccountNumber) {
      alert("Vui lòng nhập đầy đủ thông tin tài khoản.");
      return;
    }
    try {
      if (!token) {
        alert("Bạn chưa đăng nhập hoặc thiếu token.");
        return;
      }
      const payload = {
        bankName: newBankName,
        accountHolder: newAccountHolder,
        accountNumber: newAccountNumber,
      };
      const res = await addBankAccount(payload, token);
      const msg = res?.message || "Đã thêm tài khoản rút tiền";
      alert(msg);
      if (Array.isArray(res?.bankAccounts)) {
        setAccounts(res.bankAccounts);
        const last = res.bankAccounts[res.bankAccounts.length - 1];
        if (last) setAccount(`${last.bankName}|${last.accountNumber}`);
      }
      setNewBankName("");
      setNewAccountHolder("");
      setNewAccountNumber("");
      setAddOpen(false);
    } catch (err) {
      console.error("Add bank account error:", err);
      alert(err?.message || "Không thể thêm tài khoản rút tiền");
    }
  };

  return (
    <div className={`gv-dashboard-root ${sidebarCollapsed ? "collapsed" : ""}`}>
      <header className="gv-topbar" role="banner">
        <div className="gv-topbar-left">
          <div className="gv-brand-mini">
            <span className="gv-brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e3a8a">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <span className="gv-brand-text">EduLearn</span>
          </div>
          <span className="gv-divider" aria-hidden="true" />
          <div className="gv-breadcrumb" aria-label="Breadcrumb"> 
            <button 
              type="button" 
              className="gv-collapse-btn" 
              aria-label={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"} 
              onClick={() => setSidebarCollapsed(v => !v)} 
            > 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{transform: sidebarCollapsed ? "scaleX(-1)" : "none"}}> 
                <polyline points="9 6 5 12 9 18" strokeLinecap="round" strokeLinejoin="round" /> 
                <line x1="13" y1="7" x2="20" y2="7" strokeLinecap="round" /> 
                <line x1="13" y1="12" x2="20" y2="12" strokeLinecap="round" /> 
                <line x1="13" y1="17" x2="20" y2="17" strokeLinecap="round" /> 
              </svg> 
            </button> 
             <span className="gv-bc-label">Rút tiền</span> 
          </div>
        </div>
        <div className="gv-topbar-right">
          <div className="gv-avatar" title="Tài khoản">
            <span className="gv-presence" />
          </div>
        </div>
      </header>

      <div className="gv-dashboard">
        <aside className="gv-sidebar">
          <nav className="gv-nav">
            <ul>
              <li>
                <Link href="/giangvien/tongquan">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" width="18" height="18" aria-hidden="true">
                      <path d="M20 42 L60 18 L100 42 V82 H20 Z" fill="none" stroke="#2b2b2b" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M24 82 H96" fill="none" stroke="#2b2b2b" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M34 52 C44 66,76 66,86 52" fill="none" stroke="#2b2b2b" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  Tổng quan
                </Link>
              </li>
              <li>
                <Link href="/giangvien/khoahoc">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true">
                      <rect width="256" height="256" fill="none"/>
                      <path d="M128,88 a32,32,0,0,1,32-32 h64 a8,8,0,0,1,8,8 V192 a8,8,0,0,1-8,8 H160 a32,32,0,0,0-32,32" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
                      <path d="M24,192 a8,8,0,0,0,8,8 H96 a32,32,0,0,1,32,32 V88 A32,32,0,0,0,96,56 H32 a8,8,0,0,0-8,8 Z" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/>
                    </svg>
                  </span>
                  Khóa học
                </Link>
              </li>
              <li>
                <Link href="/giangvien/hocvien">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#000000" d="M10 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8z M4 8a6 6 0 1 1 12 0A6 6 0 0 1 4 8z m12.828-4.243a1 1 0 0 1 1.415 0 a6 6 0 0 1 0 8.486 a1 1 0 1 1-1.415-1.415 a4 4 0 0 0 0-5.656 a1 1 0 0 1 0-1.415z m.702 13a1 1 0 0 1 1.212-.727 c1.328.332 2.169 1.18 2.652 2.148 c.468.935.606 1.98.606 2.822 a1 1 0 1 1-2 0 c0-.657-.112-1.363-.394-1.928 c-.267-.533-.677-.934-1.349-1.102 a1 1 0 0 1-.727-1.212z M6.5 18 C5.24 18 4 19.213 4 21 a1 1 0 1 1-2 0 c0-2.632 1.893-5 4.5-5h7 c2.607 0 4.5 2.368 4.5 5 a1 1 0 1 1-2 0 c0-1.787-1.24-3-2.5-3h-7z" />
                    </svg>
                  </span>
                  Học viên
                </Link>
              </li>
              <li>
                <Link href="/giangvien/doanhthu" className="active">
                  <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true">
                      <rect width="256" height="256" fill="none" />
                      <line x1="128" y1="168" x2="128" y2="184" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="128" y1="72" x2="128" y2="88" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="128" cy="128" r="96" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M104,168h36a20,20,0,0,0,0-40H116a20,20,0,0,1,0-40h36" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  Doanh thu
                </Link>
              </li>
              <li>
                <Link href="/giangvien/hoso">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden="true">
                      <path d="M416,221.25 V416 a48,48,0,0,1-48,48 H144 a48,48,0,0,1-48-48 V96 a48,48,0,0,1,48-48 h98.75 a32,32,0,0,1,22.62,9.37 L406.63,198.63 A32,32,0,0,1,416,221.25Z" fill="none" stroke="#000" strokeLinejoin="round" strokeWidth="32" />
                      <path d="M256,56 V176 a32,32,0,0,0,32,32 H408" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                      <line x1="176" y1="288" x2="336" y2="288" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                      <line x1="176" y1="368" x2="336" y2="368" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                    </svg>
                  </span>
                  Hồ sơ
                </Link>
              </li>
              <li>
                <Link href="/giangvien/danhgia">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" aria-hidden="true">
                      <path d="M123.6 391.3 c12.9-9.4 29.6-11.8 44.6-6.4 c26.5 9.6 56.2 15.1 87.8 15.1 c124.7 0 208-80.5 208-160 s-83.3-160-208-160 S48 160.5 48 240 c0 32 12.4 62.8 35.7 89.2 c8.6 9.7 12.8 22.5 11.8 35.5 c-1.4 18.1-5.7 34.7-11.3 49.4 c17-7.9 31.1-16.7 39.4-22.7 z M21.2 431.9 c1.8-2.7 3.5-5.4 5.1-8.1 c10-16.6 19.5-38.4 21.4-62.9 C17.7 326.8 0 285.1 0 240 C0 125.1 114.6 32 256 32 s256 93.1 256 208 s-114.6 208-256 208 c-37.1 0-72.3-6.4-104.1-17.9 c-11.9 8.7-31.3 20.6-54.3 30.6 c-15.1 6.6-32.3 12.6-50.1 16.1 c-.8 .2-1.6 .3-2.4 .5 c-4.4 .8-8.7 1.5-13.2 1.9 c-.2 0-.5 .1-.7 .1 c-5.1 .5-10.2 .8-15.3 .8 c-6.5 0-12.3-3.9-14.8-9.9 c-2.5-6-1.1-12.8 3.4-17.4 c4.1-4.2 7.8-8.7 11.3-13.5 c1.7-2.3 3.3-4.6 4.8-6.9 c.1-.2 .2-.3 .3-.5 z" />
                    </svg>
                  </span>
                  Đánh giá & Phản hồi
                </Link>
              </li>
             
              <li><Link href="/giangvien/caidat"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden="true"><path d="M262.29,192.31 a64,64,0,1,0,57.4,57.4 A64.13,64.13,0,0,0,262.29,192.31Z M416.39,256 a154.34,154.34,0,0,1-1.53,20.79 l45.21,35.46 A10.81,10.81,0,0,1,462.52,326 l-42.77,74 a10.81,10.81,0,0,1-13.14,4.59 l-44.9-18.08 a16.11,16.11,0,0,0-15.17,1.75 A164.48,164.48,0,0,1,325,400.8 a15.94,15.94,0,0,0-8.82,12.14 l-6.73,47.89 A11.08,11.08,0,0,1,298.77,470 H213.23 a11.11,11.11,0,0,1-10.69-8.87 l-6.72-47.82 a16.07,16.07,0,0,0-9-12.22 a155.3,155.3,0,0,1-21.46-12.57 a16,16,0,0,0-15.11-1.71 l-44.89,18.07 a10.81,10.81,0,0,1-13.14-4.58 l-42.77-74 a10.8,10.8,0,0,1,2.45-13.75 l38.21-30 a16.05,16.05,0,0,0,6-14.08 c-.36-4.17-.58-8.33-.58-12.5 s.21-8.27.58-12.35 a16,16,0,0,0-6.07-13.94 l-38.19-30 A10.81,10.81,0,0,1,49.48,186 l42.77-74 a10.81,10.81,0,0,1,13.14-4.59 l44.9,18.08 a16.11,16.11,0,0,0,15.17-1.75 A164.48,164.48,0,0,1,187,111.2 a15.94,15.94,0,0,0,8.82-12.14 l6.73-47.89 A11.08,11.08,0,0,1,213.23,42 h85.54 a11.11,11.11,0,0,1,10.69,8.87 l6.72,47.82 a16.07,16.07,0,0,0,9,12.22 a155.3,155.3,0,0,1,21.46,12.57 a16,16,0,0,0,15.11,1.71 l44.89-18.07 a10.81,10.81,0,0,1,13.14,4.58 l42.77,74 a10.8,10.8,0,0,1-2.45,13.75 l-38.21,30 a16.05,16.05,0,0,0-6.05,14.08 C416.17,247.67,416.39,251.83,416.39,256Z" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /></svg></span> Cài đặt</Link></li>
              <li>
                <Link href="/giangvien/hotro">
                  <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M8.05 9.6 c.336 0 .504-.24.554-.627 .04-.534.198-.815.847-1.26 .673-.475 1.049-1.09 1.049-1.986 0-1.325-.92-2.227-2.262-2.227 -1.02 0-1.792.492-2.1 1.29 A1.71 1.71 0 0 0 6 5.48 c0 .393.203.64.545.64 .272 0 .455-.147.564-.51 .158-.592.525-.915 1.074-.915 .61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325 -.619.433-.926.914-.926 1.64v.111 c0 .428.208.745.585.745z"/>
                      <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011 a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622 a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89 a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636 a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011 a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622 a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89 a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636 a2.89 2.89 0 0 1 4.134 0l-.715.698 a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016 a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921 a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32 a1 1 0 0 0 1.912 1.911l1.318-.016.921.944 a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016 a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921 a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32 a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z"/>
                      <path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/>
                    </svg>
                  </span>
                  Hỗ trợ
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="gvr-main">
          <section className="wd-top-cards">
            <div className="wd-card mint">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="wd-card-icon"
                aria-hidden="true"
              >
                <rect width="256" height="256" fill="none" />
                <circle cx="180" cy="144" r="16" fill="currentColor" />
                <path
                  d="M40,68 V192 a16,16,0,0,0,16,16 H216 a8,8,0,0,0,8-8 V96 a8,8,0,0,0-8-8 H60.5 A20.3,20.3,0,0,1,40,68.7 A20,20,0,0,1,60,48 H192"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="24"
                />
              </svg>
              <div className="wd-card-title">Số dư khả dụng</div>
              <div className="wd-card-value">{availableBalance.toLocaleString("vi-VN")} đ</div>
              <div className="wd-card-sub">Có thể rút ngay</div>
            </div>
            <div className="wd-card cream">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="wd-card-icon"
                aria-hidden="true"
              >
                <path
                  d="
                    M464 256
                    A208 208 0 1 1 48 256
                    a208 208 0 1 1 416 0z

                    M0 256
                    a256 256 0 1 0 512 0
                    A256 256 0 1 0 0 256z

                    M232 120
                    V256
                    c0 8 4 15.5 10.7 20
                    l96 64
                    c11 7.4 25.9 4.4 33.3-6.7
                    s4.4-25.9-6.7-33.3
                    L280 243.2
                    V120
                    c0-13.3-10.7-24-24-24
                    s-24 10.7-24 24z
                  "
                />
              </svg>
              <div className="wd-card-title">Đang chờ</div>
              <div className="wd-card-value">{pendingBalance.toLocaleString("vi-VN")} đ</div>
              <div className="wd-card-sub">Chờ thanh toán</div>
            </div>
          </section>

          <section className="wd-request gv-card">
            <div className="wd-section-title">Tạo yêu cầu rút tiền</div>
            <p className="wd-subtitle">Nhập số tiền và chọn phương thức nhận tiền</p>
            <form onSubmit={handleSubmit} className="wd-form">
              <label className="wd-label">Số tiền rút (VND) *</label>
              <input
                className="wd-input"
                type="number"
                min={0}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Nhập số tiền muốn rút"
              />
              <div className="wd-quick">
                <button type="button" className="wd-chip" onClick={() => quickSet(500000)}>500K</button>
                <button type="button" className="wd-chip" onClick={() => quickSet(1000000)}>1M</button>
                <button type="button" className="wd-chip" onClick={() => quickSet(2000000)}>2M</button>
                <button type="button" className="wd-chip" onClick={() => quickSet(5000000)}>5M</button>
              </div>
              <div className="wd-all">
                <button type="button" onClick={() => quickSet(availableBalance)} disabled={availableBalance <= 0}>
                  Rút tất cả ({availableBalance.toLocaleString("vi-VN")} đ)
                </button>
              </div>
              <div className="wd-label-row">
                <label className="wd-label">Tài khoản nhận tiền *</label>
                <button type="button" className="wd-add-account" onClick={() => setAddOpen(true)}>+ Thêm tài khoản</button>
              </div>
              {addOpen && (
                <div className="wd-add-account-form" style={{ margin: '8px 0 12px 0' }}>
                  <div className="wd-form">
                    <label className="wd-label">Ngân hàng / Ví *</label>
                    <input className="wd-input" type="text" value={newBankName} onChange={(e)=>setNewBankName(e.target.value)} placeholder="Ví dụ: Vietcombank / MoMo" />
                    <label className="wd-label">Chủ tài khoản *</label>
                    <input className="wd-input" type="text" value={newAccountHolder} onChange={(e)=>setNewAccountHolder(e.target.value)} placeholder="Họ và tên" />
                    <label className="wd-label">Số tài khoản / SĐT *</label>
                    <input className="wd-input" type="text" value={newAccountNumber} onChange={(e)=>setNewAccountNumber(e.target.value)} placeholder="Ví dụ: 0123456789" />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={handleAddAccount}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Lưu tài khoản
                      </button>
                      <button type="button" className="wd-outline-btn" onClick={() => setAddOpen(false)}>Hủy</button>
                    </div>
                  </div>
                </div>
              )}
              <select className="wd-select" value={account} onChange={(e) => setAccount(e.target.value)}>
                <option value="">Chọn tài khoản nhận tiền</option>
                {accounts.length === 0 && <option disabled>Chưa có tài khoản</option>}
                {accounts.map((a, idx) => (
                  <option key={`${a.bankName}-${a.accountNumber}-${idx}`} value={`${a.bankName}|${a.accountNumber}`}>
                    {a.bankName} {maskAcc(a.accountNumber)}
                  </option>
                ))}
              </select>

              <button type="submit" className="btn btn-primary wd-submit">
                <span className="wd-btn-icon" aria-hidden="true">➤</span>
                Yêu cầu rút tiền
              </button>
              <div className="wd-note">Thời gian xử lý: 1-3 ngày làm việc</div>
            </form>
          </section>



          <section className="wd-history gv-card">
            <div className="wd-history-head" style={{alignItems:"flex-start"}}>
              <div>
                <div className="wd-section-title">Lịch sử rút tiền</div>
                <div style={{marginTop:"14px",width:"100%"}}>
                  <div className="wd-filter-bar">
                    <div className="wd-filter-left">
                      <div className="wd-select-wrap">
                        <Select value={filterKey} onValueChange={(v) => { setFilterKey(v); setFilterInput(""); }}>
                          <SelectTrigger className="wd-select-trigger" aria-label="Chọn tiêu chí lọc">
                            <SelectValue placeholder="Chọn tiêu chí" />
                          </SelectTrigger>
                          <SelectContent className="wd-select-content">
                            {filterOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <input
                        className="wd-input-inline"
                        type={filterKey === "amount" ? "number" : "text"}
                        placeholder={
                          filterKey === "method" ? "Ví dụ: Vietcombank / MoMo" :
                          filterKey === "status" ? "Hoàn thiện / Đang xử lý" :
                          filterKey === "createdAt" ? "Năm yyyy, Tháng MM/yyyy, Ngày dd/MM/yyyy | dd-MM-yyyy | yyyy-MM-dd" :
                          filterKey === "txnId" ? "Nhập mã giao dịch" :
                          filterKey === "account" ? "Nhập tài khoản (****xxxx)" :
                          "Nhập giá trị"
                        }
                        value={filterInput}
                        onChange={(e) => setFilterInput(e.target.value)}
                      />

                      <div className="wd-actions">
                        <button type="button" onClick={applySimpleFilter} className="wd-btn wd-btn--primary">Tìm kiếm</button>
                        <button
                          type="button"
                          onClick={() => { setFilterInput(""); setFilterKey("method"); resetFilters(); }}
                          className="wd-btn wd-btn--outline"
                        >
                          Xóa lọc
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={exportCSV}
                      className="wd-btn wd-export-right"
                    >
                      Xuất Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ul className="wd-list">
              {filteredRequests.map((r) => {
                const net = r.value - r.fee;
                return (
                  <li key={r.id} className="wd-item">
                    <div className="wd-item-left">
                      <div className="wd-bank-icon">↗</div>
                      <div className="wd-item-info">
                        <div className="wd-item-title">Rút tiền qua {r.method} <span className="wd-badge">{r.status}</span></div>
                        <div className="wd-item-sub">Tài khoản {r.masked} • {displayDate(r.createdAt)} • Mã GD: {r.txnId}</div>
                      </div>
                    </div>
                    <div className="wd-item-right">
                      <div className="wd-amount">{r.value.toLocaleString("vi-VN")} đ</div>
                      <div className="wd-fee">phí: {r.fee.toLocaleString("vi-VN")} đ</div>
                      <div className="wd-net">Nhận: {net.toLocaleString("vi-VN")} đ</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}