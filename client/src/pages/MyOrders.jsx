import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReactPaginate from 'react-paginate';
import NoData from '../components/NoData';

const MyOrders = () => {
  const orders = useSelector((state) => state.orders.order);
  const [currentPage, setCurrentPage] = useState(0);
  const ordersPerPage = 5;

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = currentPage * ordersPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + ordersPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div>
      <div className="bg-white shadow-md p-3 font-semibold">
        <h1>Orden</h1>
      </div>

      {orders.length === 0 && <NoData />}

      {currentOrders.map((order, index) => (
        <div key={order._id + index} className="order rounded p-4 text-sm">
          <p>Número de pedido: Pedido {startIndex + index + 1}</p>
          <div className="flex gap-3">
            <img
              src={order.product_details.image[0]}
              alt={order.product_details.name}
              className="w-14 h-14"
            />
            <p className="font-medium">{order.product_details.name}</p>
          </div>
        </div>
      ))}

      {/* Paginación con react-paginate y estilos personalizados */}
      {orders.length > ordersPerPage && (
        <div className="flex justify-center mt-6">
          <ReactPaginate
            previousLabel="← Anterior"
            nextLabel="Siguiente →"
            pageCount={totalPages}
            onPageChange={handlePageClick}
            containerClassName="flex justify-center mt-10 gap-2"
            previousClassName="px-3 py-2 border border-yellow-400 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            nextClassName="px-3 py-2 border border-yellow-300 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabledClassName="opacity-50 cursor-not-allowed"
            activeClassName="bg-yellow-500 text-white font-bold border border-yellow-600"
            pageClassName="px-3 py-2 border border-yellow-400 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-yellow-300 transition"
          />

        </div>
      )}
    </div>
  );
};

export default MyOrders;
