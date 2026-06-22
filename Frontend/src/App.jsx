import React from 'react'
import Home from './Home/Home'
import {Routes,Route, Navigate} from 'react-router-dom'
import Courses from './Courses/Courses.jsx'
import Signup from './components/Signup'
import Contact from './components/Contact'
import About from './components/About'
import  { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthProvider'
import Cart from './components/Cart.jsx'
import Payment from './components/Payment.jsx'
import MyOrders from './components/MyOrders.jsx'
import Success from './components/Success.jsx'
import Profile from "./components/Profiles";
import BookDetail from "./components/BookDetail";
import EBookDetail from "./components/EBookDetail";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminBooks from "./admin/AdminBooks";
import AdminEBooks from "./admin/AdminEBooks";
import AdminOrders from "./admin/AdminOrders";
import AdminReviews from "./admin/AdminReviews";
import AdminGuard from "./admin/AdminGuard";
import Wishlist from "./components/Wishlist";

const App = () => {
  const[authUser,setAuthUser]=useAuth();

  return (
    <>
    <div className="dark:bg-slate-900  dark:text-white">
      <Routes>
      <Route exact path='/' element={<Home/>}></Route>

        <Route exact path='/course'
         element={authUser? <Courses/> : <Navigate to='/signup'/>} />
         
        <Route exact path='/signup' element={<Signup/>}></Route>
        <Route path="/profile" element={<Profile />} />
        <Route exact path='/about' element={<About/>}></Route>
        <Route exact path='/contact' element={<Contact/>}></Route>
        <Route exact path='/cart' element={<Cart/>}></Route>
        <Route exact path='/payment' element={<Payment/>}></Route>
        <Route exact path='/myorders' element={<MyOrders/>}></Route>
        <Route exact path='/success' element={<Success/>}></Route>
        <Route exact path='/book/:id' element={<BookDetail/>}></Route>
        <Route exact path='/ebook/:id' element={authUser ? <EBookDetail/> : <Navigate to='/signup'/>}></Route>
        <Route exact path='/wishlist' element={authUser ? <Wishlist/> : <Navigate to='/signup'/>}></Route>

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="ebooks" element={<AdminEBooks />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
      <Toaster />
      </div>
    </>
  )
}

export default App
