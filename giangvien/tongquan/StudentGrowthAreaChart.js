"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import ReactApexChart from "react-apexcharts"
import { getDashboardTotalStudents } from "../lib/instructorApi"

// Mini area chart (sparkline) cho Tổng học viên với ApexCharts
export default function StudentGrowthAreaChart({ months = 6, height = 200 }) {
  const { token } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError("")
        if (!token) throw new Error("Chưa đăng nhập hoặc thiếu token")

        const d = await getDashboardTotalStudents(token)
        const last = Number(d?.lastMonthStudents ?? 0)
        const current = Number(d?.currentMonthStudents ?? 0)
        const total = Number(d?.totalStudents ?? 0)

        let items = [
          { month: "Tháng trước", students: last },
          { month: "Tháng này", students: current }
        ]

        // Fallback: nếu dữ liệu theo tháng bằng 0 nhưng tổng > 0,
        // hiển thị tổng để tooltip không hiện 0
        if ((last === 0 && current === 0) && total > 0) {
          items = [
            { month: "Tổng", students: total },
            { month: "Tổng", students: total }
          ]
        }

        if (!cancelled) setData(items)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError(e?.message || "Không thể tải dữ liệu học viên")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token, months])

  if (loading) {
    return <div style={{ padding: "12px", color: "#6b7280" }}>Đang tải biểu đồ học viên...</div>
  }

  const labels = (data || []).map(d => d.month)
  const values = (data || []).map(d => d.students)
  const isUp = values.length >= 2 ? Number(values[1] || 0) >= Number(values[0] || 0) : true
  const lineColor = isUp ? '#22c55e' : '#ef4444'

  const options = {
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [lineColor],
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 0, opacityFrom: 0, opacityTo: 0, stops: [0, 100] },
    },
    tooltip: {
      enabled: true,
      x: { show: false },
      y: { formatter: (val) => `${new Intl.NumberFormat('vi-VN').format(Number(val || 0))} học viên` },
    },
  }

  const series = [{ name: 'Học viên', data: values }]

  return (
    <div style={{ width: '100%', height }}>
      <ReactApexChart options={options} series={series} type="area" height={height} />
    </div>
  )
}