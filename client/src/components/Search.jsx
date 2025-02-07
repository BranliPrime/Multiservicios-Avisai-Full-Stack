import React, { useEffect, useState } from 'react';
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';

const Search = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSearchPage, setIsSearchPage] = useState(false);
  const [isMobile] = useMobile()
  const params = useLocation()
  const searchText = params.search.slice(3)

  useEffect(() => {
    const isSearch = location.pathname === "/search";
    setIsSearchPage(isSearch)
  }, [location])

  const redirectToSearchPage = () => {
    navigate("/search")
  }

  const handleOnChange = (e)=>{
    const value = e.target.value
    const url = `/search?q=${value}`
    navigate(url)
}

  return (
    <div className='w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200'>
      <div>
        {
          (isMobile && isSearchPage) ? (
            <Link to={"/"} className='flex justify-center items-center h-full p-3 group-focus-within:text-primary-200'>
              <FaArrowLeft size={20} />
            </Link>
          ) : (
            <button className='flex justify-center items-center h-full p-3 group-focus-within:text-primary-200'>
              <IoSearch size={22} />
            </button>
          )
        }
      </div>
      <div className='w-full'>
        {
          !isSearchPage ? (
            <div onClick={redirectToSearchPage}>
              <TypeAnimation
                sequence={[
                  'Search "mamparas"',
                  1000,
                  'Search "puertas"',
                  1000,
                  'Search "ventanas"',
                  1000,
                  'Search "drywall"',
                  1000,
                  'Search "barrandas"',
                  1000,
                  'Search "proyectantes"',
                  1000,
                  'Search "puertas de ducha"',
                  1000,
                  'Search "sistema nova"',
                  1000,
                  'Search "muebles en melamine"',
                  1000
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>
          ) : (
            <div className='w-full h-full flex items-center'>
              <input
                type="text"
                placeholder='Search for atta del and more'
                autoFocus
                defaultValue={searchText}
                className='bg-transparent w-full outline-none'
                onChange={handleOnChange}
              />
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Search
