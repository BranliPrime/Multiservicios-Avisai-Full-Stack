import React from 'react';
import { useForm } from "react-hook-form";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider';

const EditAddressDetails = ({ close, data }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      _id: data._id,
      userId: data.userId,
      address_line: data.address_line,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      mobile: data.mobile,
    },
  });

  const { fetchAddress } = useGlobalContext();

  const onSubmit = async (data) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateAddress,
        data,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (close) {
          close();
          reset();
          fetchAddress();
        }
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto'>
      <div className='bg-white p-4 w-full max-w-lg mt-8 mx-auto rounded'>
        <div className='flex justify-between items-center gap-4'>
          <h2 className='font-semibold'>Editar Dirección</h2>
          <button onClick={close} className='hover:text-red-500'>
            <IoClose size={25} />
          </button>
        </div>
        <form className='mt-4 grid gap-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-1'>
            <label htmlFor='address_line'>Dirección (Calle, número, edificio, etc.) :</label>
            <input
              type='text'
              id='address_line'
              placeholder='Ej: Av. Javier Prado Este 1234, Oficina 101, San Borja'
              className='border bg-blue-50 p-2 rounded'
              {...register("address_line", {
                required: "La dirección es obligatoria",
                minLength: { value: 5, message: "Debe tener al menos 5 caracteres" },
              })}
            />
            {errors.address_line && <span className="text-red-500 text-sm">{errors.address_line.message}</span>}
          </div>

          <div className='grid gap-1'>
            <label htmlFor='city'>Ciudad o Departamento :</label>
            <input
              type='text'
              id='city'
              placeholder='Ej: Lima, Arequipa, Trujillo'
              className='border bg-blue-50 p-2 rounded'
              {...register("city", {
                required: "La ciudad es obligatoria",
                minLength: { value: 3, message: "La ciudad debe tener al menos 3 caracteres" }
              })}
            />
            {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
          </div>

          <div className='grid gap-1'>
            <label htmlFor='state'>Estado o Provincia :</label>
            <input
              type='text'
              id='state'
              placeholder='Ej: Lima'
              className='border bg-blue-50 p-2 rounded'
              {...register("state", {
                required: "El estado o provincia es obligatorio",
                minLength: { value: 2, message: "Debe tener al menos 2 caracteres" }
              })}
            />
            {errors.state && <span className="text-red-500 text-sm">{errors.state.message}</span>}
          </div>

          <div className='grid gap-1'>
            <label htmlFor='pincode'>Código Postal :</label>
            <input
              type='text'
              id='pincode'
              placeholder='Ej: 15023'
              className='border bg-blue-50 p-2 rounded'
              {...register("pincode", {
                required: "El código postal es obligatorio",
                pattern: { value: /^\d{3,}$/, message: "El código postal debe contener al menos 3 dígitos" }
              })}
            />
            {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode.message}</span>}
          </div>

          <div className='grid gap-1'>
            <label htmlFor='mobile'>Número de Teléfono Móvil :</label>
            <input
              type='text'
              id='mobile'
              className='border bg-blue-50 p-2 rounded'
              {...register("mobile", {
                required: "El número de móvil es obligatorio",
                pattern: { value: /^[0-9]{8,15}$/, message: "Debe ser un número de teléfono válido (8-15 dígitos)" },
              })}
            />
            {errors.mobile && <span className="text-red-500 text-sm">{errors.mobile.message}</span>}
          </div>

          <button type='submit' className='bg-primary-200 w-full py-2 font-semibold mt-4 hover:bg-primary-100'>
            Editar Dirección
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditAddressDetails;
