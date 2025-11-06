"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import ReactApexChart from "react-apexcharts"
import { getDashboardMonthlyRevenue } from "../lib/instructorApi"

// Biểu đồ doanh thu tháng này (ApexCharts - area + gradient)
export default function RevenueAreaChart({ height = 200 }) {
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
        // Lấy doanh thu tháng này và chênh lệch so với tháng trước
        const d = await getDashboardMonthlyRevenue(token)
        const current = Number(d?.currentMonthRevenue || 0)
        const diff = Number(d?.revenueDifference || 0)
        const last = current - diff
        const items = [
          { month: "Tháng trước", revenue: Math.max(0, last) },
          { month: "Tháng này", revenue: Math.max(0, current) }
        ]
        if (!cancelled) setData(items)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError(e?.message || "Không thể tải biểu đồ doanh thu")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  if (loading) {
    return <div style={{ padding: "12px", color: "#6b7280" }}>Đang tải biểu đồ doanh thu...</div>
  }

  const labels = (data || []).map(d => d.month)
  const values = (data || []).map(d => d.revenue)
  const isUp = values.length >= 2 ? Number(values[1] || 0) >= Number(values[0] || 0) : true
  const lineColor = isUp ? '#22c55e' : '#ef4444'

  const options = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
    },
    colors: [lineColor],
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0,
        opacityFrom: 0,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: labels,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: {
      y: {
        formatter: (val) => `${new Intl.NumberFormat('vi-VN').format(Number(val || 0))} VNĐ`,
      },
    },
  }

  const series = [{ name: 'Doanh thu', data: values }]

  return (
    <div style={{ width: '100%', height }}>
      <ReactApexChart options={options} series={series} type="area" height={height} />
    </div>
  )
}