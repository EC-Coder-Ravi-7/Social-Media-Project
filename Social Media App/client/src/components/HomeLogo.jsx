import React, { useContext, useEffect, useState } from 'react';
import logoimg from '../images/SocialeX.png';
import '../styles/HomeLogo.css';
import { TbSearch } from 'react-icons/tb';
import { GeneralContext } from '../context/GeneralContextProvider';
import Search from './Search';

const HomeLogo = () => {

  const {socket} = useContext(GeneralContext);

  const [search, setSearch] = useState('');
  const [searchedUser, setSearchedUser] = useState();

  const handleSearch = () => {
    if (!search.trim()) return;

    socket.emit('user-search', {
      username: search.trim()
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleSearchedUser = ({ user }) => {
      setSearchedUser(user);
    };

    socket.on('searched-user', handleSearchedUser);

    return () => {
      socket.off('searched-user', handleSearchedUser);
    };
  }, [socket]);


  return (
    <div className="LogoSearch">
       <img className='logoImg' src={logoimg} alt="" />
       <div className="Search">
           <input type="text" placeholder='Search' onChange={(e)=> {setSearch(e.target.value)}} value={search} />
           <div className="s-icon" onClick={handleSearch}>
              <TbSearch />
           </div>
       </div>
       <Search searchedUser={searchedUser} setSearchedUser={setSearchedUser} />
   </div>
  )
}

export default HomeLogo