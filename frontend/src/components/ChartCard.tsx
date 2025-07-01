import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
} from 'recharts'

type Props = {
  title: string
  type: 'bar' | 'line'
  data: { name: string; receita?: number; despesa?: number; saldo?: number }[]
}

function ChartCard({ title, type, data }: Props) {
  return (
    <div className="card animate-fadeIn delay-200">
      <h3 className="font-bold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="receita" fill="#00FF7F" />
            <Bar dataKey="despesa" fill="#ff4d4d" />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="saldo" stroke="#00FF7F" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default ChartCard
