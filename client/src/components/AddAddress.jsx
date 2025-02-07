import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const AddAddress = ({ close }) => {
  // Configuramos el modo "onChange" para que la validación se ejecute en cada cambio
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: "onChange" })
  const { fetchAddress } = useGlobalContext()

  const onSubmit = async (data) => {
    console.log("data", data)

    try {
      const response = await Axios({
        ...SummaryApi.createAddress,
        data: {
          address_line: data.addressline,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          mobile: data.mobile
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        if (close) {
          close()
          reset()
          fetchAddress()
        }
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }
  return (
    <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto'>
      <div className='bg-white p-4 w-full max-w-lg mt-8 mx-auto rounded'>
        <div className='flex justify-between items-center gap-4'>
          <h2 className='font-semibold'>Agregar Dirección</h2>
          <button onClick={close} className='hover:text-red-500'>
            <IoClose size={25} />
          </button>
        </div>
        {/* Instrucción para el usuario */}
        <p className='mt-2 text-sm text-gray-600'>
          Por favor, ingrese su dirección completa. Asegúrese de que la información sea correcta para evitar problemas con el envío o la ubicación.
        </p>
        <form className='mt-4 grid gap-4' onSubmit={handleSubmit(onSubmit)}>
          {/* Campo: Dirección */}
          <div className='grid gap-1'>
            <label htmlFor='addressline'>Dirección (Calle, número, edificio, etc.) :</label>
            <input
              type='text'
              id='addressline'
              placeholder='Ej: Av. Javier Prado Este 1234, Oficina 101, San Borja'
              className='border bg-blue-50 p-2 rounded'
              {...register("addressline", {
                required: "La dirección es obligatoria",
                minLength: { value: 5, message: "La dirección debe tener al menos 5 caracteres" }
              })}
            />
            {errors.addressline && <p className='text-red-500 text-sm'>{errors.addressline.message}</p>}
          </div>
          {/* Campo: Ciudad */}
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
            {errors.city && <p className='text-red-500 text-sm'>{errors.city.message}</p>}
          </div>
          {/* Campo: Estado o Provincia */}
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
            {errors.state && <p className='text-red-500 text-sm'>{errors.state.message}</p>}
          </div>
          {/* Campo: Código Postal */}
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
            {errors.pincode && <p className='text-red-500 text-sm'>{errors.pincode.message}</p>}
          </div>
          {/* Campo: Número de Teléfono Móvil */}
          <div className='grid gap-1'>
            <label htmlFor='mobile'>Número de Teléfono Móvil :</label>
            <input
              type='text'
              id='mobile'
              className='border bg-blue-50 p-2 rounded'
              placeholder='Ej: 987654321'
              {...register("mobile", {
                required: "El número de móvil es obligatorio",
                pattern: { value: /^[0-9]{8,15}$/, message: "Debe ser un número de teléfono válido (8-15 dígitos)" },
              })}
            />
            {errors.mobile && <p className='text-red-500 text-sm'>{errors.mobile.message}</p>}
          </div>

          <button type='submit' className='bg-primary-200 w-full py-2 font-semibold mt-4 hover:bg-primary-100'>
            Guardar Dirección
          </button>
        </form>
      </div>
    </section>
  )
}

export default AddAddress
