"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import ReactApexChart from "react-apexcharts"
import { getDashboardCompletionRate } from "../lib/instructorApi"

// Biểu đồ tỉ lệ hoàn thành: line mảnh màu đỏ (ApexCharts)
export default function CompletionAreaChart({ height = 200 }) {
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
        const d = await getDashboardCompletionRate(token)
        const items = [
          { month: "Tháng trước", rate: Number(d?.currentRate ? d.currentRate - d.difference : d?.lastRate || 0) },
          { month: "Tháng này", rate: Number(d?.currentRate || 0) }
        ]
        if (!cancelled) setData(items)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError(e?.message || "Không thể tải biểu đồ hoàn thành")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  if (loading) {
    return <div style={{ padding: "12px", color: "#6b7280" }}>Đang tải biểu đồ hoàn thành...</div>
  }

  const labels = (data || []).map(d => d.month)
  const values = (data || []).map(d => d.rate)
  const isUp = values.length >= 2 ? Number(values[1] || 0) >= Number(values[0] || 0) : true
  const lineColor = isUp ? '#22c55e' : '#ef4444'

  const options = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [lineColor],
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 3 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: labels,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: { show: false },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: { show: false },
    },
    grid: { show: false },
    tooltip: {
      y: { formatter: (val) => `${Number(val || 0).toFixed(2)}%` },
    },
    legend: { show: false },
  }

  const series = [{ name: 'Tỉ lệ hoàn thành', data: values }]

  return (
    <div style={{ width: '100%', height }}>
      <ReactApexChart options={options} series={series} type="line" height={height} />
    </div>
  )
}