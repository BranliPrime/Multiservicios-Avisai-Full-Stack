import React, { useEffect, useState } from 'react'
import UploadSubCategoryModel from '../components/UploadSubCategoryModel'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import DisplayTable from '../components/DisplayTable'
import { createColumnHelper } from '@tanstack/react-table'
import ViewImage from '../components/ViewImage'
import { MdDelete } from "react-icons/md";
import { HiPencil } from "react-icons/hi";
import EditSubCategory from '../components/EditSubCategory'
import toast from 'react-hot-toast'
import ConfirmBox from '../components/ConfirmBox'

const SubCategoryPage = () => {
  const [openAddSubCategory, setOpenAddSubCategory] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const columnHelper = createColumnHelper()
  const [ImageURL, setImageURL] = useState("")
  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({ _id: "" })
  const [deleteSubCategory, setDeleteSubCategory] = useState({ _id: "" })
  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const fetchSubCategory = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getSubCategory
      })
      const { data: responseData } = response

      if (responseData.success) {
        const sortedData = responseData.data.sort((a, b) => a.name.localeCompare(b.name));
        setData(sortedData)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubCategory()
  }, [])

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const column = [
    columnHelper.accessor('name', {
      header: "Nombre"
    }),
    columnHelper.accessor('image', {
      header: "Imagen",
      cell: ({ row }) => {
        return <div className='flex justify-center items-center'>
          <img
            src={row.original.image}
            alt={row.original.name}
            className='w-8 h-8 cursor-pointer'
            onClick={() => {
              setImageURL(row.original.image)
            }}
          />
        </div>
      }
    }),
    columnHelper.accessor("category", {
      header: "Categoria",
      cell: ({ row }) => {
        return (
          <>
            {row.original.category.map((c) => (
              <p key={c._id + "table"} className='shadow-md px-1 inline-block'>{c.name}</p>
            ))}
          </>
        )
      }
    }),
    columnHelper.accessor("_id", {
      header: "Acción",
      cell: ({ row }) => {
        return (
          <div className='flex items-center justify-center gap-3'>
            <button onClick={() => {
              setOpenEdit(true)
              setEditData(row.original)
            }} className='p-2 bg-green-100 rounded-full hover:text-green-600'>
              <HiPencil size={20} />
            </button>
            <button onClick={() => {
              setOpenDeleteConfirmBox(true)
              setDeleteSubCategory(row.original)
            }} className='p-2 bg-red-100 rounded-full text-red-500 hover:text-red-600'>
              <MdDelete size={20} />
            </button>
          </div>
        )
      }
    })
  ]

  const handleDeleteSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteSubCategory,
        data: deleteSubCategory
      })
      const { data: responseData } = response

      if (responseData.success) {
        toast.success(responseData.message)
        fetchSubCategory()
        setOpenDeleteConfirmBox(false)
        setDeleteSubCategory({ _id: "" })
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section className=''>
      <div className='p-2 bg-white shadow-md flex items-center justify-between'>
        <h2 className='font-semibold'>Sub Categoria</h2>
        <button onClick={() => setOpenAddSubCategory(true)} className='text-sm border border-primary-200 hover:bg-primary-200 px-3 py-1 rounded'>Agregar Sub Categoria</button>
      </div>

      <div className='overflow-auto w-full max-w-[95vw]'>
        <DisplayTable
          data={currentData}
          column={column}
        />
      </div>

      <div className="flex justify-center mt-6 gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="px-4 py-2 border border-yellow-400 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-lg shadow-sm transition ${currentPage === i + 1
                ? "bg-yellow-500 text-white font-semibold"
                : "border border-yellow-400 bg-white text-gray-700 hover:bg-yellow-400"
              }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 border border-yellow-300 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>



      {openAddSubCategory && <UploadSubCategoryModel close={() => setOpenAddSubCategory(false)} fetchData={fetchSubCategory} />}
      {ImageURL && <ViewImage url={ImageURL} close={() => setImageURL("")} />}
      {openEdit && <EditSubCategory data={editData} close={() => setOpenEdit(false)} fetchData={fetchSubCategory} />}
      {openDeleteConfirmBox && <ConfirmBox cancel={() => setOpenDeleteConfirmBox(false)} close={() => setOpenDeleteConfirmBox(false)} confirm={handleDeleteSubCategory} />}
    </section>
  )
}

export default SubCategoryPage
