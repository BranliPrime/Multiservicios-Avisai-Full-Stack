import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, LabelList
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaDollarSign, FaShoppingCart } from "react-icons/fa";

const SalesReport = () => {
  const [report, setReport] = useState({
    totalSales: 0,
    totalOrders: 0,
    salesByDate: [],
    success: false,
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        let url = "http://localhost:3002/api/order/sales-report";
        if (startDate && endDate) {
          url += `?start=${startDate.toISOString().split("T")[0]}&end=${endDate.toISOString().split("T")[0]}`;
        }

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("No se pudo obtener el reporte de ventas");

        const data = await response.json();
        setReport({
          totalSales: data.totalSales || 0,
          totalOrders: data.totalOrders || 0,
          salesByDate: Array.isArray(data.salesByDate) ? data.salesByDate : [],
          success: data.success,
        });
      } catch (error) {
        console.error("Error al obtener el reporte de ventas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, [startDate, endDate]);

  if (loading) return <p className="text-center text-gray-500 text-lg font-medium">Cargando reporte de ventas...</p>;
  if (!report.success) return <p className="text-center text-red-500 text-lg font-medium">Error al cargar el reporte.</p>;

  const chartData = report.salesByDate.map(({ _id, totalSales, totalOrders }) => ({
    date: new Date(_id).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }),
    totalSales: totalSales || 0,
    totalOrders: totalOrders || 0,
  }));

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl border border-gray-200">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-2">📊 Reporte de Ventas</h2>

      <div className="flex gap-4 mb-6 items-center">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="📅 Fecha de inicio"
          className="border p-2 rounded-lg shadow-sm"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="📅 Fecha de fin"
          className="border p-2 rounded-lg shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {[{
          title: "Total Ventas",
          value: `S/ ${report.totalSales.toFixed(2)}`,
          color: "bg-green-600",
          icon: <FaDollarSign className="text-5xl opacity-30" />, 
        }, {
          title: "Total Órdenes",
          value: report.totalOrders,
          color: "bg-blue-600",
          icon: <FaShoppingCart className="text-5xl opacity-30" />, 
        }].map(({ title, value, color, icon }, index) => (
          <div key={index} className={`${color} p-6 rounded-xl text-white flex justify-between items-center shadow-lg`}>
            <div>
              <p className="text-3xl font-semibold">{value}</p>
              <p className="text-lg">{title}</p>
            </div>
            {icon}
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-100 p-6 rounded-lg">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">📊 Gráfico de Ventas</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 14, fill: "#555" }} 
              angle={-45} 
              textAnchor="end"
              label={{  position: "insideBottom", offset: -30 }}
            />
            <YAxis 
              tick={{ fontSize: 14, fill: "#555" }}
              domain={[0, (dataMax) => Math.ceil(dataMax * 1.2)]} 
            />
            <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "10px", padding: "10px", border: "1px solid #ddd" }} />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="totalSales" fill="#4CAF50" name="Total Ventas" barSize={50} radius={[10, 10, 0, 0]}>
              <LabelList dataKey="totalSales" position="top" fill="#333" fontSize={14} formatter={(value) => `S/ ${value}`} />
            </Bar>
            <Bar dataKey="totalOrders" fill="#2196F3" name="Total Órdenes" barSize={50} radius={[10, 10, 0, 0]}>
              <LabelList dataKey="totalOrders" position="top" fill="#333" fontSize={14} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesReport;
