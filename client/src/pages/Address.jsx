import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AddAddress from '../components/AddAddress';
import { MdDelete, MdEdit } from "react-icons/md";
import EditAddressDetails from '../components/EditAddressDetails';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';
import { IoClose } from "react-icons/io5";

const Address = () => {
  const addressList = useSelector(state => state.addresses.addressList);
  const [openAddress, setOpenAddress] = useState(false);
  const [OpenEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { fetchAddress } = useGlobalContext();

  const handleDeleteCancel = () => {
    setOpenDelete(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress,
        data: { _id: deleteId }
      });

      if (response.data.success) {
        toast.success("Dirección eliminada correctamente");
        fetchAddress();
        setOpenDelete(false);
        setDeleteId(null);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <div className=''>
      <div className='bg-white shadow-lg px-2 py-2 flex justify-between gap-4 items-center '>
        <h2 className='font-semibold text-ellipsis line-clamp-1'>Dirección</h2>
        <button
          onClick={() => setOpenAddress(true)}
          className='border border-primary-200 text-primary-200 px-3 hover:bg-primary-200 hover:text-black py-1 rounded-full font-semibold'>
          Agregar Dirección
        </button>
      </div>

      <div className='bg-blue-50 p-2 grid gap-4'>
        {addressList.map((address) => (
          <div key={address._id} className={`border rounded p-3 flex gap-3 bg-white ${!address.status && 'hidden'}`}>
            <div className='w-full'>
              <p><strong className='font-semibold'>Dirección:</strong> {address.address_line}</p>
              <p><strong className='font-semibold'>Ciudad:</strong> {address.city}</p>
              <p><strong className='font-semibold'>Estado/Provincia:</strong> {address.state}</p>
              <p><strong className='font-semibold'>Código Postal:</strong> {address.pincode}</p>
              <p><strong className='font-semibold'>Teléfono:</strong> {address.mobile}</p>
            </div>
            <div className='grid gap-10'>
              <button
                onClick={() => {
                  setOpenEdit(true);
                  setEditData(address);
                }}
                className='bg-green-200 p-1 rounded hover:text-white hover:bg-green-600'>
                <MdEdit />
              </button>
              <button
                onClick={() => {
                  setDeleteId(address._id);
                  setOpenDelete(true);
                }}
                className='bg-red-200 p-1 rounded hover:text-white hover:bg-red-600'>
                <MdDelete size={20} />
              </button>
            </div>
          </div>
        ))}

        <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer'>
          Agregar Dirección
        </div>
      </div>

      {
        openAddress && (
          <AddAddress close={() => setOpenAddress(false)} />
        )
      }

      {
        OpenEdit && (
          <EditAddressDetails data={editData} close={() => setOpenEdit(false)} />
        )
      }

      {
        openDelete && (
          <section className='fixed top-0 left-0 right-0 bottom-0 bg-neutral-600 z-50 bg-opacity-70 p-4 flex justify-center items-center '>
            <div className='bg-white p-4 w-full max-w-md rounded-md'>
              <div className='flex items-center justify-between gap-4'>
                <h3 className='font-semibold'>Eliminar Permanente</h3>
                <button onClick={() => setOpenDelete(false)}>
                  <IoClose size={25} />
                </button>
              </div>
              <p className='my-2'>¿Estas seguro de eliminar tu dirección permanente?</p>
              <div className='flex justify-end gap-5 py-4'>
                <button onClick={handleDeleteCancel} className='border px-3 py-1 rounded bg-red-100 border-red-500 text-red-500 hover:bg-red-200'>Cancel</button>
                <button onClick={handleDelete} className='border px-3 py-1 rounded bg-green-100 border-green-500 text-green-500 hover:bg-green-200'>Delete</button>
              </div>
            </div>
          </section>
        )
      }
    </div>
  );
};

export default Address;
