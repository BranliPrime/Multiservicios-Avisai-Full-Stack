import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from './AddToCartButton'
import { DisplayPriceInSoles } from '../utils/DisplayPriceInSoles'

const CardProduct = ({ data }) => {
    const url = `/product/${valideURLConvert(data.name)}-${data._id}`
    const isOutOfStock = data.stock === 0;

    return (
        <Link to={url} className={`border py-2 lg:p-4 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white ${isOutOfStock ? 'opacity-50' : ''}`}>
            <div className='min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden'>
                <img 
                    src={data.image[0]}
                    className='w-full h-full object-scale-down lg:scale-125'
                />
            </div>
            <div className='flex items-center gap-1'>
                <div className='rounded text-xs w-fit p-[1px] px-2 text-green-600 bg-green-50 font-semibold'>
                    10 min 
                </div>
                {Boolean(data.discount) && (
                    <p className='text-red-600 bg-red-200 px-2 w-fit text-xs rounded-full font-semibold'>{data.discount}% descuento</p>
                )}
            </div>
            <div className='px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2'>
                {data.name}
            </div>
            <div className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base'>
                {data.unit} 
            </div>

            <div className='px-2 lg:px-0 flex items-center justify-between gap-1 lg:gap-3 text-sm lg:text-base'>
                <div className='font-semibold'>
                    {DisplayPriceInSoles(pricewithDiscount(data.price, data.discount))} 
                </div>
                <div>
                    {isOutOfStock ? (
                        <p className='text-red-500 text-sm text-center'>Agotado</p>
                    ) : (
                        <AddToCartButton data={data} />
                    )}
                </div>
            </div>
        </Link>
    )
}

export default CardProduct;
