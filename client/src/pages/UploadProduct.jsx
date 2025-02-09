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
import { useEffect } from 'react';

const UploadProduct = () => {
  const [data, setData] = useState({
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
  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false)
  const [ViewImageURL, setViewImageURL] = useState("")
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory, setSelectCategory] = useState("")
  const [selectSubCategory, setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)

  const [openAddField, setOpenAddField] = useState(false)
  const [fieldName, setFieldName] = useState("")


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Evitar valores negativos en stock y price
    let newValue = value;
    if ((name === "stock" || name === "price") && value < 0) {
      newValue = 0;
    }

    // Actualizar datos
    setData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validaciones en tiempo real
    let newErrors = { ...errors };

    if (name === "name" && value.trim().length < 3) {
      newErrors[name] = "El nombre debe tener al menos 3 caracteres";
    } else if (name === "stock" && (value === "" || value <= 0)) {
      newErrors[name] = "El stock debe ser un número positivo";
    } else if (name === "price" && (value === "" || value <= 0)) {
      newErrors[name] = "El precio debe ser mayor a 0";
    } else if (name === "discount" && (value <= 0 || value > 100)) {
      newErrors[name] = "El descuento debe estar entre 0 y 100";
    } else {
      delete newErrors[name]; // Si el campo es válido, eliminamos el error
    }

    setErrors(newErrors);
  };




  const handleUploadImage = async (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }
    setImageLoading(true)
    const response = await uploadImage(file)
    const { data: ImageResponse } = response
    const imageUrl = ImageResponse.data.url

    setData((preve) => {
      return {
        ...preve,
        image: [...preve.image, imageUrl]
      }
    })
    setImageLoading(false)

  }

  const handleDeleteImage = async (index) => {
    data.image.splice(index, 1)
    setData((preve) => {
      return {
        ...preve
      }
    })
  }

  const handleRemoveCategory = async (index) => {
    data.category.splice(index, 1)
    setData((preve) => {
      return {
        ...preve
      }
    })
  }
  const handleRemoveSubCategory = async (index) => {
    data.subCategory.splice(index, 1)
    setData((preve) => {
      return {
        ...preve
      }
    })
  }

  const handleAddField = () => {
    setData((preve) => {
      return {
        ...preve,
        more_details: {
          ...preve.more_details,
          [fieldName]: ""
        }
      }
    })
    setFieldName("")
    setOpenAddField(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Inicializar un arreglo para los errores
    let errores = [];

    // Validar campos obligatorios
    if (!data.name.trim()) {
      errores.push("El nombre es obligatorio");
    }
    if (!data.description.trim()) {
      errores.push("La descripción es obligatoria");
    }
    if (!data.unit.trim()) {
      errores.push("La unidad es obligatoria");
    }
    if (!data.stock.trim()) {
      errores.push("El stock es obligatorio");
    }
    if (!data.price.trim()) {
      errores.push("El precio es obligatorio");
    }

    if (errores.length > 0) {
      alert(errores.join("\n"));
      return;
    }


    const stock = Number(data.stock);
    const price = Number(data.price);
    const discount = data.discount !== "" ? Number(data.discount) : null;

    // Validar valores negativos
    if (stock < 0 || price < 0) {
      alert("El stock y el precio no pueden ser negativos");
      return;
    }

    // Validar descuento si tiene un valor
    if (discount !== null && discount < 0) {
      alert("El descuento no puede ser negativo");
      return;
    }

    try {
      const response = await Axios({ ...SummaryApi.createProduct, data });
      if (response.data.success) {
        successAlert(response.data.message);
        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: null, 
          description: "",
          more_details: {},
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };


  // useEffect(()=>{
  //   successAlert("Upload successfully")
  // },[])
  return (
    <section className=''>
      <div className='p-2   bg-white shadow-md flex items-center justify-between'>
        <h2 className='font-semibold'>Subir producto</h2>
      </div>
      <div className='grid p-3'>
        <form className='grid gap-4' onSubmit={handleSubmit}>
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
            {errors.name && (
              <p className='text-red-500 text-sm'>{errors.name}</p>
            )}
          </div>
          <div className='grid gap-1'>
            <label htmlFor='description' className='font-medium'>Descripción</label>
            <textarea
              id='description'
              type='text'
              placeholder='Ingrese la descripción del producto'
              name='description'
              value={data.description}
              onChange={handleChange}
              required
              multiple
              rows={3}
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none'
            />
          </div>
          <div>
            <p className='font-medium'>Imagen</p>
            <div>
              <label htmlFor='productImage' className='bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer'>
                <div className='text-center flex justify-center items-center flex-col'>
                  {
                    imageLoading ? <Loading /> : (
                      <>
                        <FaCloudUploadAlt size={35} />
                        <p>Subir Imagen</p>
                      </>
                    )
                  }
                </div>
                <input
                  type='file'
                  id='productImage'
                  className='hidden'
                  accept='image/*'
                  onChange={handleUploadImage}
                />
              </label>
              {/**display uploded image*/}
              <div className='flex flex-wrap gap-4'>
                {
                  data.image.map((img, index) => {
                    return (
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
                    )
                  })
                }
              </div>
            </div>

          </div>
          <div className='grid gap-1'>
            <label className='font-medium'>Categoria</label>
            <div>
              <select
                className='bg-blue-50 border w-full p-2 rounded'
                value={selectCategory}
                onChange={(e) => {
                  const value = e.target.value
                  const category = allCategory.find(el => el._id === value)

                  setData((preve) => {
                    return {
                      ...preve,
                      category: [...preve.category, category],
                    }
                  })
                  setSelectCategory("")
                }}
              >
                <option value={""}>Selecciónar Categoria</option>
                {
                  allCategory.map((c, index) => {
                    return (
                      <option value={c?._id}>{c.name}</option>
                    )
                  })
                }
              </select>
              <div className='flex flex-wrap gap-3'>
                {
                  data.category.map((c, index) => {
                    return (
                      <div key={c._id + index + "productsection"} className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                        <p>{c.name}</p>
                        <div className='hover:text-red-500 cursor-pointer' onClick={() => handleRemoveCategory(index)}>
                          <IoClose size={20} />
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
          <div className='grid gap-1'>
            <label className='font-medium'>Sub Categoria</label>
            <div>
              <select
                className='bg-blue-50 border w-full p-2 rounded'
                value={selectSubCategory}
                onChange={(e) => {
                  const value = e.target.value
                  const subCategory = allSubCategory.find(el => el._id === value)

                  setData((preve) => {
                    return {
                      ...preve,
                      subCategory: [...preve.subCategory, subCategory]
                    }
                  })
                  setSelectSubCategory("")
                }}
              >
                <option value={""} className='text-neutral-600'>Selecciónar Sub Categoria</option>
                {
                  allSubCategory.map((c, index) => {
                    return (
                      <option value={c?._id}>{c.name}</option>
                    )
                  })
                }
              </select>
              <div className='flex flex-wrap gap-3'>
                {
                  data.subCategory.map((c, index) => {
                    return (
                      <div key={c._id + index + "productsection"} className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                        <p>{c.name}</p>
                        <div className='hover:text-red-500 cursor-pointer' onClick={() => handleRemoveSubCategory(index)}>
                          <IoClose size={20} />
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>

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
          </div>

          <div className="grid gap-1">
            <label htmlFor="stock" className="font-medium">Stock</label>
            {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
            <input
              id="stock"
              type="number"
              placeholder="Ingrese la cantidad de stock"
              name="stock"
              value={data.stock}
              onChange={handleChange}
              min="0"
              className={`bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded ${errors.stock ? "border-red-500" : ""
                }`}
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="price" className="font-medium">Precio</label>
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            <input
              id="price"
              type="number"
              placeholder="Ingrese el precio del producto"
              name="price"
              value={data.price}
              onChange={handleChange}
              min="0"
              className={`bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded ${errors.stock ? "border-red-500" : ""
              }`}
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="discount" className="font-medium">Descuento</label>
            {errors.discount && <p className="text-red-500 text-sm">{errors.discount}</p>}
            <input
              id="discount"
              type="number"
              placeholder="Ingrese el descuento del producto"
              name="discount"
              value={data.discount}
              min="0"
              max="100"
              onChange={handleChange}
              className={`bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded ${errors.discount ? "border-red-500" : ""
                }`}
            />
          </div>


          {/**add more field**/}
          {
            Object?.keys(data?.more_details)?.map((k, index) => {
              return (
                <div className='grid gap-1'>
                  <label htmlFor={k} className='font-medium'>{k}</label>
                  <input
                    id={k}
                    type='text'
                    value={data?.more_details[k]}
                    onChange={(e) => {
                      const value = e.target.value
                      setData((preve) => {
                        return {
                          ...preve,
                          more_details: {
                            ...preve.more_details,
                            [k]: value
                          }
                        }
                      })
                    }}
                    required
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>
              )
            })
          }

          <div onClick={() => setOpenAddField(true)} className=' hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded'>
            Agregar Campos
          </div>

          <button
            className='bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold'
          >
            Enviar
          </button>
        </form>
      </div>

      {
        ViewImageURL && (
          <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
        )
      }

      {
        openAddField && (
          <AddFieldComponent
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            submit={handleAddField}
            close={() => setOpenAddField(false)}
          />
        )
      }
    </section>
  )
}

export default UploadProduct