import React from 'react'
import { IoClose } from "react-icons/io5";

const AddFieldComponent = ({ close, value, onChange, submit }) => {
  return (
    <section className='fixed top-0 bottom-0 right-0 left-0 bg-neutral-900 bg-opacity-70 z-50 flex justify-center items-center p-4'>
      <div className='bg-white rounded p-4 w-full max-w-md'>
        <div className='flex items-center justify-between gap-3'>
          <h1 className='font-semibold'>Agregar Campos</h1>
          <button onClick={close}>
            <IoClose size={25} />
          </button>
        </div>
        <input
          className='bg-blue-50 my-3 p-2 border outline-none focus-within:border-primary-100 rounded w-full '
          placeholder='Ingrese el nombre del campo'
          value={value}
          onChange={onChange}
          required
        />
        <button
          onClick={submit}
          className='bg-primary-200 hover:bg-primary-100 px-4 py-2 rounded mx-auto w-fit block'
        >Agregar Campos</button>
      </div>
    </section>
  )
}

export default AddFieldComponent