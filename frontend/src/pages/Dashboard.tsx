import React from 'react'

const Dashboard = () => {
  return (
    <div className="min-h-screen p-6 bg-primary text-light animate-fadeIn">
      <h1 className="text-3xl font-bold mb-4 text-accent">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-light text-black p-4 rounded shadow animate-slideUp">📊 Card 1</div>
        <div className="bg-light text-black p-4 rounded shadow animate-slideUp">💰 Card 2</div>
        <div className="bg-light text-black p-4 rounded shadow animate-slideUp">📈 Card 3</div>
      </div>
    </div>
  )
}

export default Dashboard
