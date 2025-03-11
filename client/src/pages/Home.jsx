import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import banner from '../assets/banner.png';
import bannerMobile from '../assets/banner-mobile.jpg';
import { valideURLConvert } from '../utils/valideURLConvert';
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay';

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory);
  const categoryData = useSelector(state => state.product.allCategory) || [];
  const subCategoryData = useSelector(state => state.product.allSubCategory) || [];
  const navigate = useNavigate();

  // Memoizar el mapeo de subcategorías para optimizar búsqueda
  const subCategoryMap = useMemo(() => {
    return subCategoryData.reduce((acc, sub) => {
      sub.category.forEach(cat => {
        acc[cat._id] = sub;
      });
      return acc;
    }, {});
  }, [subCategoryData]);

  const handleRedirectProductListpage = useCallback((id, cat) => {
    const subcategory = subCategoryMap[id];

    if (!subcategory) return;

    const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`;
    navigate(url);
  }, [navigate, subCategoryMap]);

  return (
    <section className="bg-white">
      <div className="container mx-auto">
        <div className={`w-full h-full min-h-48 bg-blue-100 rounded ${!banner && "animate-pulse my-2"}`}>
          <img
            src={banner}
            className="w-full h-full hidden lg:block"
            alt="Promoción"
            loading="lazy"
          />
          <img
            src={bannerMobile}
            className="w-full h-full lg:hidden"
            alt="Promoción móvil"
            loading="lazy"
          />
        </div>
      </div>


      <div className="container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {loadingCategory ? (
          Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse">
              <div className="bg-blue-100 min-h-24 rounded"></div>
              <div className="bg-blue-100 h-8 rounded"></div>
            </div>
          ))
        ) : (
          categoryData.map(cat => (
            <div
              key={cat._id}
              className="w-full h-full cursor-pointer"
              onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
            >
              <img
                src={cat.image}
                className="w-full h-52 object-scale-down"
                alt={cat.name}
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>

      {/* Productos por categoría */}
      {categoryData.map(c => (
        <CategoryWiseProductDisplay key={c._id} id={c._id} name={c.name} />
      ))}
    </section>
  );
};

export default Home;
