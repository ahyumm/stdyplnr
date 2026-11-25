"use client";

import React, { useState, useEffect } from "react";

interface Task {
  id: number;
  judul: string;
  kategori: "Produktif PPLG" | "Projek" | "Umum";
  deadline: string;
  status: "Belum Selesai" | "Selesai";
}

interface Jadwal {
  id: number;
  hari: string;
  jam: string;
  mapel: string;
}

type ActivePage = "dashboard" | "tasks" | "schedule" | "focus" | "backup";

export default function Dashboard() {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);

  // Input Tugas
  const [judulInput, setJudulInput] = useState("");
  const [kategoriInput, setKategoriInput] = useState<"Produktif PPLG" | "Projek" | "Umum">("Produktif PPLG");
  const [deadlineInput, setDeadlineInput] = useState("");

  // Input Jadwal
  const [hariInput, setHariInput] = useState("Senin");
  const [jamInput, setJamInput] = useState("07:30 - 10:00");
  const [mapelInput, setMapelInput] = useState("");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"Semua" | "Belum Selesai" | "Selesai">("Semua");

  // Pomodoro
  const [focusMode, setFocusMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFocusTaskId, setSelectedFocusTaskId] = useState<number | "">("");

  useEffect(() => {
    const savedTasks = localStorage.getItem("study_tasks_v2");
    const savedJadwals = localStorage.getItem("study_jadwals_v2");
    const savedTheme = localStorage.getItem("study_theme");

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([
        { id: 1, judul: "Pemrograman Web: Selesaikan CRUD Next.js", kategori: "Produktif PPLG", deadline: "2026-12-01", status: "Belum Selesai" },
        { id: 2, judul: "Matematika: Latihan Halaman 45", kategori: "Umum", deadline: "2026-11-28", status: "Belum Selesai" },
      ]);
    }

    if (savedJadwals) {
      setJadwals(JSON.parse(savedJadwals));
    } else {
      setJadwals([
        { id: 1, hari: "Senin", jam: "07:30 - 11:30", mapel: "Pemrograman Web & Perangkat Bergerak" },
        { id: 2, hari: "Selasa", jam: "07:30 - 10:30", mapel: "Matematika & Bahasa Inggris" },
      ]);
    }

    if (savedTheme === "dark") setDarkMode(true);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("study_tasks_v2", JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("study_jadwals_v2", JSON.stringify(jadwals));
  }, [jadwals, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("study_theme", darkMode ? "dark" : "light");
  }, [darkMode, isLoaded]);

  // Pomodoro Timer Logic
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const switchTimerMode = (mode: "focus" | "break") => {
    setIsRunning(false);
    setFocusMode(mode);
    setSecondsLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const getCountdown = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(deadlineStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Terlewat ${Math.abs(diffDays)} hari`, color: "bg-red-100 text-red-700" };
    if (diffDays === 0) return { text: "Hari Ini!", color: "bg-orange-100 text-orange-700" };
    if (diffDays === 1) return { text: "Besok (H-1)", color: "bg-amber-100 text-amber-700" };
    return { text: `H-${diffDays} Hari lagi`, color: "bg-emerald-100 text-emerald-700" };
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulInput || !deadlineInput) return;
    const newTask: Task = {
      id: Date.now(),
      judul: judulInput,
      kategori: kategoriInput,
      deadline: deadlineInput,
      status: "Belum Selesai",
    };
    setTasks([newTask, ...tasks]);
    setJudulInput("");
    setDeadlineInput("");
  };

  const toggleStatus = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: t.status === "Selesai" ? "Belum Selesai" : "Selesai" } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (selectedFocusTaskId === id) setSelectedFocusTaskId("");
  };

  const handleAddJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelInput) return;
    const newJadwal: Jadwal = {
      id: Date.now(),
      hari: hariInput,
      jam: jamInput || "07:30 - 10:00",
      mapel: mapelInput,
    };
    setJadwals([...jadwals, newJadwal]);
    setMapelInput("");
  };

  const deleteJadwal = (id: number) => {
    setJadwals(jadwals.filter((j) => j.id !== id));
  };

  // Fitur Backup & Restore (Ekspor & Impor JSON)
  const exportData = () => {
    const data = { tasks, jadwals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup-study-planner-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks && parsed.jadwals) {
          setTasks(parsed.tasks);
          setJadwals(parsed.jadwals);
          alert("Data berhasil dipulihkan (Restore)!");
        } else {
          alert("Format file cadangan tidak valid.");
        }
      } catch {
        alert("Gagal membaca file JSON.");
      }
    };
    reader.readAsText(file);
  };

  const filteredTasks = tasks
    .filter((t) => {
      const matchesSearch = t.judul.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "Semua" || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const totalTugas = tasks.length;
  const tugasSelesai = tasks.filter((t) => t.status === "Selesai").length;
  const tugasBelumSelesai = totalTugas - tugasSelesai;
  const progressPercent = totalTugas === 0 ? 0 : Math.round((tugasSelesai / totalTugas) * 100);

  const hariList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const hariIni = hariList[new Date().getDay()];
  const jadwalHariIni = jadwals.filter((j) => j.hari === hariIni);

  // Tema Warna
  const bgMain = darkMode ? "bg-[#141E1A]" : "bg-[#F4F7F4]";
  const bgSidebar = darkMode ? "bg-[#192621] border-[#2E4039]" : "bg-white border-[#D8E2DC]";
  const bgCard = darkMode ? "bg-[#1E2B26] border-[#2E4039]" : "bg-white border-[#D8E2DC]";
  const textTitle = darkMode ? "text-[#E2ECE9]" : "text-[#2D4A3E]";
  const textSub = darkMode ? "text-[#9BB5AA]" : "text-[#5A7467]";
  const inputStyle = darkMode ? "bg-[#141E1A] border-[#2E4039] text-[#E2ECE9] placeholder-[#6B857B]" : "bg-white border-[#D8E2DC] text-slate-700 placeholder-slate-400";
  const itemCard = darkMode ? "bg-[#17231E] border-[#2E4039]" : "bg-[#FAFDFB] border-[#D8E2DC]";

  const navItems: { id: ActivePage; label: string; icon: string }[] = [
    { id: "dashboard", label: "Ringkasan", icon: "📊" },
    { id: "tasks", label: "Tugas", icon: "📝" },
    { id: "schedule", label: "Jadwal", icon: "📅" },
    { id: "focus", label: "Fokus", icon: "⏱️" },
    { id: "backup", label: "Backup", icon: "💾" },
  ];

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${bgMain}`}>
      {/* SIDEBAR DESKTOP */}
      <aside className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r p-6 justify-between ${bgSidebar}`}>
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h1 className={`text-xl font-bold tracking-tight ${textTitle}`}>StudyPlanner</h1>
            </div>
            <p className={`text-xs mt-1 ${textSub}`}>XII D PPLG • Afra Humaira</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active ? "bg-[#52796F] text-white shadow-sm" : `${textSub} hover:bg-[#52796F]/10`
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full px-4 py-2.5 rounded-xl font-medium text-xs border transition flex items-center justify-center gap-2 ${
              darkMode ? "bg-[#2E4039] text-[#E2ECE9] border-[#3F574E] hover:bg-[#3A5248]" : "bg-[#E2ECE9] text-[#2D4A3E] border-[#C5D6CD] hover:bg-[#D2E2DA]"
            }`}
          >
            {darkMode ? "☀️ Mode Terang" : "🌙 Mode Gelap"}
          </button>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <header className={`md:hidden sticky top-0 z-20 px-5 py-4 border-b flex justify-between items-center ${bgSidebar}`}>
        <div>
          <h1 className={`text-lg font-bold ${textTitle}`}>StudyPlanner 🌱</h1>
          <p className={`text-xs ${textSub}`}>Afra Humaira • XII D PPLG</p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
            darkMode ? "bg-[#2E4039] text-[#E2ECE9] border-[#3F574E]" : "bg-[#E2ECE9] text-[#2D4A3E] border-[#C5D6CD]"
          }`}
        >
          {darkMode ? "☀️ Terang" : "🌙 Gelap"}
        </button>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 md:pl-64 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto p-5 md:p-10 space-y-8">

          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <>
              <div className={`p-6 md:p-8 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${bgCard}`}>
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#E2ECE9] text-[#2D4A3E] mb-2">
                    Hari {hariIni}
                  </span>
                  <h2 className={`text-2xl md:text-3xl font-bold ${textTitle}`}>Halo, Afra Humaira! 👋</h2>
                  <p className={`text-sm mt-1 ${textSub}`}>Tetap semangat menyelesaikan target belajar dan projek PPLG hari ini.</p>
                </div>
                <button
                  onClick={() => setActivePage("tasks")}
                  className="bg-[#52796F] hover:bg-[#3F5D53] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-sm"
                >
                  + Kelola Tugas
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border shadow-sm ${bgCard}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${textSub}`}>Total Tugas</p>
                  <p className={`text-3xl font-bold mt-2 ${textTitle}`}>{totalTugas}</p>
                  <div className="w-full bg-slate-200/50 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-[#3B7A57] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className={`text-xs mt-1.5 ${textSub}`}>{progressPercent}% tugas selesai</p>
                </div>

                <div className={`p-5 rounded-2xl border shadow-sm ${bgCard}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${textSub}`}>Belum Selesai</p>
                  <p className="text-3xl font-bold text-[#D97706] mt-2">{tugasBelumSelesai}</p>
                  <p className={`text-xs mt-4 ${textSub}`}>Perlu segera dikerjakan</p>
                </div>

                <div className={`p-5 rounded-2xl border shadow-sm ${bgCard}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${textSub}`}>Selesai</p>
                  <p className="text-3xl font-bold text-[#3B7A57] mt-2">{tugasSelesai}</p>
                  <p className={`text-xs mt-4 ${textSub}`}>Kerja bagus, pertahankan!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${bgCard}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-bold ${textTitle}`}>Tugas Prioritas 🔥</h3>
                    <button onClick={() => setActivePage("tasks")} className="text-xs font-semibold text-[#52796F] hover:underline">Lihat Semua →</button>
                  </div>
                  {tasks.filter((t) => t.status === "Belum Selesai").length === 0 ? (
                    <p className={`text-sm py-6 text-center ${textSub}`}>Semua tugas sudah selesai! 🎉</p>
                  ) : (
                    <div className="space-y-3">
                      {tasks
                        .filter((t) => t.status === "Belum Selesai")
                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                        .slice(0, 3)
                        .map((task) => {
                          const countdown = getCountdown(task.deadline);
                          return (
                            <div key={task.id} className={`p-3.5 rounded-xl border flex justify-between items-center gap-3 ${itemCard}`}>
                              <div>
                                <p className={`font-semibold text-sm ${textTitle}`}>{task.judul}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold rounded ${countdown.color}`}>{countdown.text}</span>
                              </div>
                              <button onClick={() => toggleStatus(task.id)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E2ECE9] text-[#3B7A57] hover:bg-[#D0E2DC] transition shrink-0">
                                Selesai ✓
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${bgCard}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-bold ${textTitle}`}>Jadwal Hari {hariIni} 📚</h3>
                    <button onClick={() => setActivePage("schedule")} className="text-xs font-semibold text-[#52796F] hover:underline">Atur Jadwal →</button>
                  </div>
                  {jadwalHariIni.length === 0 ? (
                    <p className={`text-sm py-6 text-center ${textSub}`}>Tidak ada jadwal pelajaran untuk hari {hariIni}.</p>
                  ) : (
                    <div className="space-y-3">
                      {jadwalHariIni.map((j) => (
                        <div key={j.id} className={`p-3.5 rounded-xl border ${itemCard}`}>
                          <span className="text-xs font-semibold text-[#52796F]">{j.jam}</span>
                          <p className={`font-semibold text-sm mt-0.5 ${textTitle}`}>{j.mapel}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TUGAS & DEADLINE */}
          {activePage === "tasks" && (
            <>
              <div>
                <h2 className={`text-2xl font-bold ${textTitle}`}>Tugas & Deadline 📝</h2>
                <p className={`text-sm mt-1 ${textSub}`}>Catat dan pantau tenggat waktu tugas sekolahmu.</p>
              </div>

              <section className={`p-6 rounded-2xl shadow-sm border ${bgCard}`}>
                <h3 className={`text-base font-semibold mb-4 ${textTitle}`}>Tambah Tugas Baru</h3>
                <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <input
                    type="text"
                    placeholder="Nama tugas..."
                    value={judulInput}
                    onChange={(e) => setJudulInput(e.target.value)}
                    className={`md:col-span-5 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                  <select
                    value={kategoriInput}
                    onChange={(e) => setKategoriInput(e.target.value as any)}
                    className={`md:col-span-3 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  >
                    <option value="Produktif PPLG">Produktif PPLG</option>
                    <option value="Projek">Projek</option>
                    <option value="Umum">Umum</option>
                  </select>
                  <input
                    type="date"
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    className={`md:col-span-2 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                  <button type="submit" className="md:col-span-2 bg-[#52796F] hover:bg-[#3F5D53] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
                    Simpan
                  </button>
                </form>
              </section>

              <section className={`p-6 rounded-2xl shadow-sm border ${bgCard}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                  <div className="flex gap-2">
                    {(["Semua", "Belum Selesai", "Selesai"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          filterStatus === status ? "bg-[#52796F] text-white" : darkMode ? "bg-[#141E1A] text-[#9BB5AA]" : "bg-[#F0F5F1] text-[#5A7467]"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="🔍 Cari tugas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full md:w-64 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                </div>

                {filteredTasks.length === 0 ? (
                  <p className={`text-center py-10 text-sm ${textSub}`}>Tidak ada tugas ditemukan.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => {
                      const countdown = getCountdown(task.deadline);
                      return (
                        <div key={task.id} className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl border gap-4 ${itemCard}`}>
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#52796F]/15 text-[#52796F]">{task.kategori}</span>
                              {task.status === "Belum Selesai" && <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md ${countdown.color}`}>{countdown.text}</span>}
                            </div>
                            <h4 className={`font-semibold text-base ${task.status === "Selesai" ? "line-through opacity-50" : ""} ${textTitle}`}>{task.judul}</h4>
                            <p className={`text-xs ${textSub}`}>Deadline: {task.deadline}</p>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                            <button
                              onClick={() => toggleStatus(task.id)}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition ${
                                task.status === "Selesai" ? "bg-[#E2ECE9] text-[#3B7A57]" : "bg-[#FEF3C7] text-[#92400E]"
                              }`}
                            >
                              {task.status}
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1">Hapus</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* JADWAL PELAJARAN */}
          {activePage === "schedule" && (
            <>
              <div>
                <h2 className={`text-2xl font-bold ${textTitle}`}>Jadwal Pelajaran 📅</h2>
                <p className={`text-sm mt-1 ${textSub}`}>Jadwal mingguan kelas XII D PPLG.</p>
              </div>

              <section className={`p-6 rounded-2xl shadow-sm border ${bgCard}`}>
                <h3 className={`text-base font-semibold mb-4 ${textTitle}`}>Tambah Jadwal Baru</h3>
                <form onSubmit={handleAddJadwal} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <select
                    value={hariInput}
                    onChange={(e) => setHariInput(e.target.value)}
                    className={`md:col-span-3 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  >
                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Jam (cth: 07:30)"
                    value={jamInput}
                    onChange={(e) => setJamInput(e.target.value)}
                    className={`md:col-span-3 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                  <input
                    type="text"
                    placeholder="Nama Mata Pelajaran..."
                    value={mapelInput}
                    onChange={(e) => setMapelInput(e.target.value)}
                    className={`md:col-span-4 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  />
                  <button type="submit" className="md:col-span-2 bg-[#3B7A57] hover:bg-[#2C5E42] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
                    Tambah
                  </button>
                </form>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map((hari) => {
                  const listMapel = jadwals.filter((j) => j.hari === hari);
                  const isToday = hari === hariIni;
                  return (
                    <div key={hari} className={`p-5 rounded-2xl border shadow-sm ${bgCard} ${isToday ? "ring-2 ring-[#52796F]" : ""}`}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-bold ${textTitle}`}>{hari}</h3>
                        {isToday && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#52796F] text-white">Hari Ini</span>}
                      </div>
                      {listMapel.length === 0 ? (
                        <p className={`text-xs py-4 ${textSub}`}>Belum ada jadwal.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {listMapel.map((item) => (
                            <div key={item.id} className={`p-3.5 rounded-xl border flex justify-between items-center gap-3 ${itemCard}`}>
                              <div>
                                <p className="text-xs font-semibold text-[#52796F]">{item.jam}</p>
                                <p className={`text-sm font-medium mt-0.5 ${textTitle}`}>{item.mapel}</p>
                              </div>
                              <button onClick={() => deleteJadwal(item.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1">Hapus</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* MODE FOKUS */}
          {activePage === "focus" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${textTitle}`}>Mode Fokus Belajar ⏱️</h2>
                <p className={`text-sm mt-1 ${textSub}`}>Teknik Pomodoro: 25 menit fokus, 5 menit istirahat.</p>
              </div>

              <div className={`p-8 rounded-3xl border shadow-sm text-center space-y-6 ${bgCard}`}>
                <div className="inline-flex p-1 rounded-xl bg-[#52796F]/10">
                  <button onClick={() => switchTimerMode("focus")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${focusMode === "focus" ? "bg-[#52796F] text-white" : textSub}`}>
                    Fokus (25 Min)
                  </button>
                  <button onClick={() => switchTimerMode("break")} className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${focusMode === "break" ? "bg-[#3B7A57] text-white" : textSub}`}>
                    Istirahat (5 Min)
                  </button>
                </div>

                <div className={`text-6xl md:text-7xl font-extrabold tracking-wider font-mono py-4 ${textTitle}`}>
                  {formatTime(secondsLeft)}
                </div>

                <div className="text-left space-y-2">
                  <label className={`block text-xs font-semibold ${textSub}`}>Target Tugas Sesi Ini:</label>
                  <select
                    value={selectedFocusTaskId}
                    onChange={(e) => setSelectedFocusTaskId(e.target.value ? Number(e.target.value) : "")}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52796F] ${inputStyle}`}
                  >
                    <option value="">-- Pilih tugas yang ingin dikerjakan --</option>
                    {tasks.filter((t) => t.status === "Belum Selesai").map((t) => (
                      <option key={t.id} value={t.id}>{t.judul}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button onClick={() => setIsRunning(!isRunning)} className="bg-[#52796F] hover:bg-[#3F5D53] text-white font-semibold px-8 py-3 rounded-xl transition shadow-sm">
                    {isRunning ? "Jeda Timer" : "Mulai Fokus"}
                  </button>
                  <button onClick={() => switchTimerMode(focusMode)} className={`px-5 py-3 rounded-xl font-semibold text-sm border transition ${darkMode ? "border-[#2E4039] text-[#E2ECE9]" : "border-[#D8E2DC] text-[#2D4A3E]"}`}>
                    Reset
                  </button>
                </div>

                {selectedFocusTaskId !== "" && (
                  <div className="pt-2 border-t border-dashed border-[#52796F]/30">
                    <button onClick={() => { toggleStatus(Number(selectedFocusTaskId)); setSelectedFocusTaskId(""); }} className="text-xs font-semibold text-[#3B7A57] hover:underline">
                      ✓ Tandai tugas terpilih sudah selesai
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BACKUP & RESTORE */}
          {activePage === "backup" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h2 className={`text-2xl font-bold ${textTitle}`}>Backup & Restore Data 💾</h2>
                <p className={`text-sm mt-1 ${textSub}`}>Amankan data tugas dan jadwalmu dengan mengunduhnya ke file cadangan.</p>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm space-y-6 ${bgCard}`}>
                <div className="space-y-3">
                  <h3 className={`font-semibold text-base ${textTitle}`}>1. Unduh Cadangan (Backup)</h3>
                  <p className={`text-xs ${textSub}`}>Simpan seluruh data tugas dan jadwalmu ke file berformat `.json` ke perangkatmu.</p>
                  <button onClick={exportData} className="bg-[#52796F] hover:bg-[#3F5D53] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-sm">
                    📥 Download File Backup (.json)
                  </button>
                </div>

                <hr className="border-t border-[#52796F]/20" />

                <div className="space-y-3">
                  <h3 className={`font-semibold text-base ${textTitle}`}>2. Pulihkan Data (Restore)</h3>
                  <p className={`text-xs ${textSub}`}>Pilih file `.json` cadangan yang sebelumnya pernah kamu download untuk mengembalikan data.</p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className={`block w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#52796F] file:text-white hover:file:bg-[#3F5D53] ${textSub}`}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* BOTTOM NAV MOBILE */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-20 border-t grid grid-cols-5 py-2 ${bgSidebar}`}>
        {navItems.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium transition ${active ? "text-[#52796F] font-bold" : textSub}`}
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}