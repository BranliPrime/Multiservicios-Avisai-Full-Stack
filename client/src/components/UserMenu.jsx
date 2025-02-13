import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Divider from './Divider';
import Axios from '../utils/Axios';
import SummaryAPi from '../common/SummaryApi';
import { logout } from '../store/userSlice';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { HiOutlineExternalLink } from 'react-icons/hi';
import isAdmin from '../utils/isAdmin';

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (typeof close === 'function') {
          close();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [close]);

  const handleLogout = async () => {
    try {
      const response = await Axios(SummaryAPi.logout);
      if (response.data.success) {
        if (typeof close === 'function') {
          close();
        }
        dispatch(logout());
        localStorage.clear();
        toast.success(response.data.message);
        navigate('/');
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <div ref={menuRef}>
      <div className="font-semibold">Mi cuenta</div>
      <div className="text-sm flex items-center gap-2">
        <span className="max-w-52 text-ellipsis line-clamp-1">
          {user?.name || user?.mobile || 'Usuario'}{' '}
          {user?.role === 'ADMIN' && (
            <span className="text-medium text-red-600">(Admin)</span>
          )}
        </span>
        <Link onClick={() => close && close()} to={'/dashboard/profile'} className="hover:text-primary-200">
          <HiOutlineExternalLink size={15} />
        </Link>
      </div>

      <Divider />

      <div className="text-sm grid gap-1">
        {isAdmin(user?.role) && (
          <>
            {/* Opciones del ADMIN */}
            <Link onClick={() => close && close()} to={'/dashboard/category'} className="px-2 hover:bg-orange-200 py-1">
              Categoría
            </Link>
            <Link onClick={() => close && close()} to={'/dashboard/subcategory'} className="px-2 hover:bg-orange-200 py-1">
              Sub Categoría
            </Link>
            <Link onClick={() => close && close()} to={'/dashboard/upload-product'} className="px-2 hover:bg-orange-200 py-1">
              Subir un producto
            </Link>
            <Link onClick={() => close && close()} to={'/dashboard/product'} className="px-2 hover:bg-orange-200 py-1">
              Producto
            </Link>

            <Link
              to="/dashboard/sales-report" 
              className="px-2 hover:bg-orange-200 py-1"
              onClick={() => close && close()} 
            >
              Reporte de Ventas
            </Link>
          </>
        )}

        {/* Opciones para todos los usuarios */}
        <Link onClick={() => close && close()} to={'/dashboard/myorders'} className="px-2 hover:bg-orange-200 py-1">
          Mis pedidos
        </Link>
        <Link onClick={() => close && close()} to={'/dashboard/address'} className="px-2 hover:bg-orange-200 py-1">
          Guardar Dirección
        </Link>

        <button onClick={handleLogout} className="text-left px-2 hover:bg-orange-200 py-1">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
