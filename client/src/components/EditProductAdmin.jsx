import React, { useState } from 'react'
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux'
import { IoClose } from "react-icons/io5";
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';

const EditProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  // Estado inicial del producto a editar (recibido desde props)
  const [data, setData] = useState({
    _id: propsData._id,
    name: propsData.name,
    image: propsData.image,
    category: propsData.category,
    subCategory: propsData.subCategory,
    unit: propsData.unit,
    stock: propsData.stock,
    price: propsData.price,
    discount: propsData.discount,
    description: propsData.description,
    more_details: propsData.more_details || {},
  })
  // Estado para errores del formulario
  const [formErrors, setFormErrors] = useState({})
  const [imageLoading, setImageLoading] = useState(false)
  const [ViewImageURL, setViewImageURL] = useState("")
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory, setSelectCategory] = useState("")
  const [selectSubCategory, setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)
  const [openAddField, setOpenAddField] = useState(false)
  const [fieldName, setFieldName] = useState("")

  // Función que valida un campo individual y retorna el mensaje de error (o cadena vacía si es válido)
  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
        return "";
      case 'description':
        if (!value || value.trim().length < 10) return "La descripción debe tener al menos 10 caracteres";
        return "";
      case 'unit':
        if (!value || value.trim() === "") return "La unidad es obligatoria";
        return "";
      case 'stock':
        if (value === "" || Number(value) < 0) return "La cantidad en stock debe ser un número positivo";
        return "";
      case 'price':
        if (value === "" || Number(value) <= 0) return "El precio debe ser mayor a 0";
        return "";
      case 'discount':
        const discountValue = Number(value);
        return value !== '' && (isNaN(discountValue) || discountValue <= 0 || discountValue > 100) ? 'El descuento debe estar entre 0 y 100' : '';

    }
  }

  // Maneja el cambio en los campos y valida simultáneamente el valor ingresado
  const handleChange = (e) => {
    const { name, value } = e.target

    if (value < 0) {
      console.errorr("El valor debe ser un numero positivo")
      return;
    }

    setData((prev) => ({
      ...prev,
      [name]: value
    }))

    const errorMsg = validateField(name, value)
    setFormErrors(prev => {
      const nuevosErrores = { ...prev }
      if (errorMsg) {
        nuevosErrores[name] = errorMsg
      } else {
        delete nuevosErrores[name]
      }
      return nuevosErrores
    })
  }

  // Maneja la carga de imágenes
  const handleUploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageLoading(true)
    const response = await uploadImage(file)
    const { data: ImageResponse } = response
    const imageUrl = ImageResponse.data.url
    setData((prev) => ({
      ...prev,
      image: [...prev.image, imageUrl]
    }))
    setImageLoading(false)
  }

  // Elimina una imagen de la lista
  const handleDeleteImage = async (index) => {
    data.image.splice(index, 1)
    setData((prev) => ({ ...prev }))
  }

  // Elimina una categoría de la lista
  const handleRemoveCategory = async (index) => {
    data.category.splice(index, 1)
    setData((prev) => ({ ...prev }))
  }

  // Elimina una subcategoría de la lista
  const handleRemoveSubCategory = async (index) => {
    data.subCategory.splice(index, 1)
    setData((prev) => ({ ...prev }))
  }

  // Agrega un campo adicional en "more_details"
  const handleAddField = () => {
    setData((prev) => ({
      ...prev,
      more_details: {
        ...prev.more_details,
        [fieldName]: ""
      }
    }))
    setFieldName("")
    setOpenAddField(false)
  }

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validar todos los campos
    const errors = {}
    errors.name = validateField('name', data.name)
    errors.description = validateField('description', data.description)
    errors.unit = validateField('unit', data.unit)
    errors.stock = validateField('stock', data.stock)
    errors.price = validateField('price', data.price)
    errors.discount = validateField('discount', data.discount)

    // Filtrar campos sin error (cadena vacía)
    Object.keys(errors).forEach(key => {
      if (errors[key] === "") delete errors[key]
    })

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      // Enfoca el primer campo con error
      const firstErrorField = Object.keys(errors)[0]
      const element = document.getElementsByName(firstErrorField)[0]
      if (element) element.focus()
      return
    }
    console.log("data", data)
    try {
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: data
      })
      const { data: responseData } = response
      if (responseData.success) {
        successAlert(responseData.message)
        if (close) {
          close()
        }
        fetchProductData()
        // Reinicia los datos después de actualizar
        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          description: "",
          more_details: {},
        })
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section className='fixed top-0 right-0 left-0 bottom-0 bg-black z-50 bg-opacity-70 p-4'>
      <div className='bg-white w-full p-4 max-w-2xl mx-auto rounded overflow-y-auto h-full max-h-[95vh]'>
        <section>
          {/* Encabezado del formulario */}
          <div className='p-2 bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Editar Producto</h2>
            <button onClick={close}>
              <IoClose size={20} />
            </button>
          </div>
          <div className='grid p-3'>
            <form className='grid gap-4' onSubmit={handleSubmit}>
              {/* Campo: Nombre */}
              <div className='grid gap-1'>
                <label htmlFor='name' className='font-medium'>Nombre</label>
                <input
                  id='name'
                  type='text'
                  placeholder='Ingrese el nombre del producto'
                  name='name'
                  value={data.name}
                  onChange={handleChange}
                  required
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                />
                {formErrors.name && <p className='text-red-500 text-sm'>{formErrors.name}</p>}
              </div>
              {/* Campo: Descripción */}
              <div className='grid gap-1'>
                <label htmlFor='description' className='font-medium'>Descripción</label>
                <textarea
                  id='description'
                  placeholder='Ingrese la descripción del producto'
                  name='description'
                  value={data.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none'
                />
                {formErrors.description && <p className='text-red-500 text-sm'>{formErrors.description}</p>}
              </div>
              {/* Sección de Imágenes */}
              <div>
                <p className='font-medium'>Imágenes</p>
                <div>
                  <label htmlFor='productImage' className='bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer'>
                    <div className='text-center flex justify-center items-center flex-col'>
                      {imageLoading ? <Loading /> : (
                        <>
                          <FaCloudUploadAlt size={35} />
                          <p>Subir Imagen</p>
                        </>
                      )}
                    </div>
                    <input
                      type='file'
                      id='productImage'
                      className='hidden'
                      accept='image/*'
                      onChange={handleUploadImage}
                    />
                  </label>
                  {/* Mostrar imágenes subidas */}
                  <div className='flex flex-wrap gap-4'>
                    {data.image.map((img, index) => (
                      <div key={img + index} className='h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group'>
                        <img
                          src={img}
                          alt={img}
                          className='w-full h-full object-scale-down cursor-pointer'
                          onClick={() => setViewImageURL(img)}
                        />
                        <div onClick={() => handleDeleteImage(index)} className='absolute bottom-0 right-0 p-1 bg-red-600 hover:bg-red-600 rounded text-white hidden group-hover:block cursor-pointer'>
                          <MdDelete />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Campo: Categoría */}
              <div className='grid gap-1'>
                <label className='font-medium'>Categoría</label>
                <div>
                  <select
                    className='bg-blue-50 border w-full p-2 rounded'
                    value={selectCategory}
                    onChange={(e) => {
                      const value = e.target.value
                      const category = allCategory.find(el => el._id === value)
                      setData((prev) => ({
                        ...prev,
                        category: [...prev.category, category],
                      }))
                      setSelectCategory("")
                    }}
                  >
                    <option value={""}>Seleccione Categoría</option>
                    {allCategory.map((c, index) => (
                      <option key={c?._id + index} value={c?._id}>{c.name}</option>
                    ))}
                  </select>
                  <div className='flex flex-wrap gap-3'>
                    {data.category.map((c, index) => (
                      <div key={c._id + index + "productsection"} className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                        <p>{c.name}</p>
                        <div className='hover:text-red-500 cursor-pointer' onClick={() => handleRemoveCategory(index)}>
                          <IoClose size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Campo: Subcategoría */}
              <div className='grid gap-1'>
                <label className='font-medium'>Subcategoría</label>
                <div>
                  <select
                    className='bg-blue-50 border w-full p-2 rounded'
                    value={selectSubCategory}
                    onChange={(e) => {
                      const value = e.target.value
                      const subCategory = allSubCategory.find(el => el._id === value)
                      setData((prev) => ({
                        ...prev,
                        subCategory: [...prev.subCategory, subCategory]
                      }))
                      setSelectSubCategory("")
                    }}
                  >
                    <option value={""} className='text-neutral-600'>Seleccione Subcategoría</option>
                    {allSubCategory.map((c, index) => (
                      <option key={c?._id + index} value={c?._id}>{c.name}</option>
                    ))}
                  </select>
                  <div className='flex flex-wrap gap-3'>
                    {data.subCategory.map((c, index) => (
                      <div key={c._id + index + "productsection"} className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                        <p>{c.name}</p>
                        <div className='hover:text-red-500 cursor-pointer' onClick={() => handleRemoveSubCategory(index)}>
                          <IoClose size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Campo: Unidad */}
              <div className='grid gap-1'>
                <label htmlFor='unit' className='font-medium'>Unidad</label>
                <input
                  id='unit'
                  type='text'
                  placeholder='Ingrese la unidad del producto'
                  name='unit'
                  value={data.unit}
                  onChange={handleChange}
                  required
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                />
                {formErrors.unit && <p className='text-red-500 text-sm'>{formErrors.unit}</p>}
              </div>
              {/* Campo: Stock */}
              <div className='grid gap-1'>
                <label htmlFor='stock' className='font-medium'>Cantidad en Stock</label>
                <input
                  id='stock'
                  type='number'
                  placeholder='Ingrese la cantidad en stock'
                  name='stock'
                  value={data.stock}
                  onChange={handleChange}
                  required
                  min='0'
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                />
                {formErrors.stock && <p className='text-red-500 text-sm'>{formErrors.stock}</p>}
              </div>
              {/* Campo: Precio */}
              <div className='grid gap-1'>
                <label htmlFor='price' className='font-medium'>Precio</label>
                <input
                  id='price'
                  type='number'
                  placeholder='Ingrese el precio del producto'
                  name='price'
                  min='0'
                  value={data.price}
                  onChange={handleChange}
                  required
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                />
                {formErrors.price && <p className='text-red-500 text-sm'>{formErrors.price}</p>}
              </div>
              {/* Campo: Descuento */}
              <div className='grid gap-1'>
                <label htmlFor='discount' className='font-medium'>Descuento</label>
                <input
                  id='discount'
                  type='number'
                  placeholder='Ingrese el descuento del producto'
                  name='discount'
                  value={data.discount}
                  onChange={handleChange}
                  min='0'
                  max='100'
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                />
                {formErrors.discount && <p className='text-red-500 text-sm'>{formErrors.discount}</p>}
              </div>
              {/* Sección para agregar campos adicionales */}
              {
                Object.keys(data.more_details).map((k, index) => (
                  <div className='grid gap-1' key={k + index}>
                    <label htmlFor={k} className='font-medium'>{k}</label>
                    <input
                      id={k}
                      type='text'
                      value={data.more_details[k]}
                      onChange={(e) => {
                        const value = e.target.value
                        setData((prev) => ({
                          ...prev,
                          more_details: {
                            ...prev.more_details,
                            [k]: value
                          }
                        }))
                      }}
                      required
                      className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                    />
                  </div>
                ))
              }
              <div onClick={() => setOpenAddField(true)} className='hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded'>
                Agregar Campo
              </div>
              <button className='bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold'>
                Actualizar Producto
              </button>
            </form>
          </div>
          {ViewImageURL && (
            <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
          )}
          {openAddField && (
            <AddFieldComponent
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              submit={handleAddField}
              close={() => setOpenAddField(false)}
            />
          )}
        </section>
      </div>
    </section>
  )
}

export default EditProductAdmin
