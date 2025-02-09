import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import jsPDF from 'jspdf';
import { DisplayPriceInSoles } from '../utils/DisplayPriceInSoles';
import priceWithDiscount from '../utils/PriceWithDiscount';
import logo from '../assets/logo.png';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const boletaRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;
    img.onload = function () {
      doc.addImage(img, 'PNG', 10, 10, 50, 20);
      doc.html(boletaRef.current, {
        callback: function (doc) {
          doc.save('boleta.pdf');
        },
        margin: [40, 10, 10, 10],
        html2canvas: { scale: 0.5 },
      });
    };
  };

  return (
    <div className='m-2 w-full max-w-md bg-green-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
      <p className='text-green-800 font-bold text-lg text-center'>
        {Boolean(location?.state?.text) ? location?.state?.text : 'Pago'} realizado con éxito.
      </p>

      <InvoiceForm setInvoiceData={setInvoiceData} />

      {invoiceData ? (
        <>
          <div ref={boletaRef} className='p-4 border rounded bg-white w-full text-sm'>
            <h2 className='font-bold text-center text-lg mb-2'>Boleta de Venta Electrónica</h2>

            <div className='border-b pb-2 mb-2'>
              <p><strong>Empresa:</strong> MULTISERVICIOS AVISAI</p>
              <p><strong>RUC:</strong> 20607289574</p>
              <p><strong>Dirección:</strong> Av. Panamericána Sur, Junin, Perú</p>
            </div>

            <div className='border-b pb-2 mb-2'>
              <p><strong>Cliente:</strong> {invoiceData.nombre || invoiceData.razonSocial}</p>
              <p><strong>Documento:</strong> {invoiceData.tipoDocumento === 'dni' ? invoiceData.dni : invoiceData.ruc}</p>
            </div>

            <table className='w-full text-left border-collapse border border-gray-300 text-xs'>
              <thead>
                <tr className='bg-gray-200'>
                  <th className='border border-gray-300 p-1'>Descripción</th>
                  <th className='border border-gray-300 p-1'>Cantidad</th>
                  <th className='border border-gray-300 p-1'>Precio</th>
                  <th className='border border-gray-300 p-1'>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.productos.map((item) => {
                  const precioConDescuento = priceWithDiscount(item.productId.price, item.productId.discount || 0);
                  return (
                    <tr key={item.productId._id}>
                      <td className='border border-gray-300 p-1'>{item.productId.name}</td>
                      <td className='border border-gray-300 p-1 text-center'>{item.quantity}</td>
                      <td className='border border-gray-300 p-1'>{DisplayPriceInSoles(precioConDescuento)}</td>
                      <td className='border border-gray-300 p-1'>
                        {DisplayPriceInSoles(item.quantity * precioConDescuento)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {(() => {
              const subtotalCalculado = invoiceData.productos.reduce((acc, item) => {
                const precioConDescuento = priceWithDiscount(item.productId.price, item.productId.discount || 0);
                return acc + item.quantity * precioConDescuento;
              }, 0);

              const igv = subtotalCalculado * 0.18;
              const totalPagar = subtotalCalculado + igv;

              return (
                <div className='border-t pt-2 mt-2'>
                  <p><strong>Subtotal:</strong> {DisplayPriceInSoles(subtotalCalculado)}</p>
                  <p><strong>IGV (18%):</strong> {DisplayPriceInSoles(igv)}</p>
                  <p className='text-lg font-bold'><strong>Total a Pagar:</strong> {DisplayPriceInSoles(totalPagar)}</p>
                  <p><strong>Forma de pago:</strong> Tarjeta / Efectivo</p>
                </div>
              );
            })()}
          </div>

          <div className='grid grid-cols-2 gap-4 mt-4'>
            <button
              onClick={handlePrint}
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition'
            >
              Vista Previa
            </button>

            <button
              onClick={handleDownloadPDF}
              className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition'
            >
              Descargar PDF
            </button>
          </div>

          <div className='mt-4'>
            <Link
              to='/'
              className='border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition-all px-4 py-2 rounded'
            >
              Ir a Inicio
            </Link>
          </div>
        </>
      ) : (
        <p className='text-gray-600 text-sm'>Complete los datos para generar la boleta.</p>
      )}
    </div>
  );
};

export default Success;
  