import React, { useState } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInSoles } from '../utils/DisplayPriceInSoles';
import AddAddress from '../components/AddAddress';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector(state => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector(state => state.cartItem.cart);
  const navigate = useNavigate();

  const handleCashOnDelivery = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem();
        fetchOrder();
        navigate('/success', {
          state: { text: 'Orden' },
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      toast.loading('Cargando...');
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      const stripePromise = await loadStripe(stripePublicKey, { locale: 'es' }); // Asegura que esté en español

      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });

      const { data: responseData } = response;

      await stripePromise.redirectToCheckout({ sessionId: responseData.id });

      fetchCartItem();
      fetchOrder();
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="bg-blue-50">
      <div className="container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold">Elige tu dirección</h3>
          <div className="bg-white p-2 grid gap-4">
            {addressList.map((address, index) => (
              <label key={index} htmlFor={'address' + index} className={!address.status ? 'hidden' : ''}>
                <div className="border rounded p-3 flex gap-3 hover:bg-blue-50">
                  <div>
                    <input
                      id={'address' + index}
                      type="radio"
                      value={index}
                      onChange={(e) => setSelectAddress(Number(e.target.value))}
                      name="address"
                    />
                  </div>
                  <div>
                    <p>
                      <strong className="font-semibold">Dirección:</strong> {address.address_line}
                    </p>
                    <p>
                      <strong className="font-semibold">Ciudad:</strong> {address.city}
                    </p>
                    <p>
                      <strong className="font-semibold">Estado/Provincia:</strong> {address.state}
                    </p>
                    <p>
                      <strong className="font-semibold">Código Postal:</strong> {address.pincode}
                    </p>
                    <p>
                      <strong className="font-semibold">Teléfono:</strong> {address.mobile}
                    </p>
                  </div>
                </div>
              </label>
            ))}
            <div onClick={() => setOpenAddress(true)} className="h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer">
              Agregar dirección
            </div>
          </div>
        </div>

        <div className="w-full max-w-md bg-white py-4 px-2">
          <h3 className="text-lg font-semibold">Resumen</h3>
          <div className="bg-white p-4">
            <h3 className="font-semibold">Detalles de la factura</h3>
            <div className="flex gap-4 justify-between ml-1">
              <p>Total de artículos</p>
              <p className="flex items-center gap-2">
                <span className="line-through text-neutral-400">{DisplayPriceInSoles(notDiscountTotalPrice)}</span>
                <span>{DisplayPriceInSoles(totalPrice)}</span>
              </p>
            </div>
            <div className="flex gap-4 justify-between ml-1">
              <p>Cantidad total</p>
              <p className="flex items-center gap-2">{totalQty} artículo(s)</p>
            </div>
            <div className="flex gap-4 justify-between ml-1">
              <p>Costo de envío</p>
              <p className="flex items-center gap-2">Gratis</p>
            </div>
            <div className="font-semibold flex items-center justify-between gap-4">
              <p>Total</p>
              <p>{DisplayPriceInSoles(totalPrice)}</p>
            </div>
          </div>
          <div className="w-full flex flex-col gap-4">
            <button className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white font-semibold" onClick={handleOnlinePayment}>
              Pago en línea
            </button>
            <button className="py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white" onClick={handleCashOnDelivery}>
              Pago contra entrega
            </button>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;
