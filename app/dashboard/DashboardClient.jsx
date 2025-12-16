"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  Truck,
  Package,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  { key: "ENTRY", label: "Entry Resep", icon: FileText },
  { key: "TRANSPORT", label: "Transport", icon: Truck },
  { key: "PACKAGING", label: "Pengemasan", icon: Package },
  { key: "READY", label: "Siap Diambil", icon: CheckCircle2 },
];

export default function DashboardClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000); // polling 10 detik
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat data antrean...
      </div>
    );
  }

  const currentIndex = STEPS.findIndex(
    (step) => step.key === data.status
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md space-y-6"
      >
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">
            Status Pengambilan Obat
          </h1>
          <p className="text-sm text-slate-500">
            Nomor Antrean:{" "}
            <span className="font-medium">{data.queueNumber}</span>
          </p>
        </div>

        {/* ESTIMASI */}
        <Card className="rounded-2xl">
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="w-8 h-8" />
            <div>
              <p className="text-xs text-slate-500">Estimasi selesai</p>
              <p className="text-lg font-semibold">
                ± {data.estimatedMinutes} menit
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PROGRESS BAR */}
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const active = index <= currentIndex;
            return (
              <div key={step.key} className="flex-1 text-center">
                <div
                  className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-300"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <p className="text-xs mt-1">{step.label}</p>
              </div>
            );
          })}
        </div>

        {/* TIMELINE */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-medium">Riwayat Proses</p>
            {data.timeline.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm text-slate-600"
              >
                <span>{item.step}</span>
                <span>{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* LOKET */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">
              Lokasi pengambilan
            </p>
            <p className="font-medium">{data.pickupCounter}</p>
          </CardContent>
        </Card>

        {/* ACTION */}
        <div className="space-y-3">
          <Button className="w-full rounded-xl">
            Berikan Penilaian
          </Button>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={fetchDashboard}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Perbarui Status
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
