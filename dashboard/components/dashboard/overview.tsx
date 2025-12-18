'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { useEffect, useState } from 'react'

interface ChartData {
  name: string
  appointments: number
  reviews: number
}

export function Overview() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/stats/chart')
        if (response.ok) {
          const chartData = await response.json()
          setData(chartData)
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="appointments"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
          name="Appointments"
        />
        <Bar
          dataKey="reviews"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-secondary"
          name="Reviews"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
