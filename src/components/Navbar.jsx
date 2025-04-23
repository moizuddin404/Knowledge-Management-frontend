import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { InputBase } from '@mui/material';
import { useLocation } from 'react-router-dom';


const pages = ['My Space', 'Public Space'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];


function Navbar({ searchQuery, handleSearchChange }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const location = useLocation();

  return (
    <AppBar position="static" 
    sx={{bgcolor: "#FAFAFA"}} 
      elevation={0}

      >

      <Container maxWidth="2xl">
        <Toolbar disableGutters sx={{ width: '100%', justifyContent: 'space-between', mx: '0.5rem'}} >
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }}}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{color: "#1f7281"}}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={()=>{handleCloseNavMenu(); if(page === 'Public Space'){
                  navigate('/suites');
                }else if(page === 'My Space') {
                  navigate('/home');
                }
                }}>
                  <Typography sx={{ textAlign: 'left' }}>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <div className='flex '>
            
            <img src='Brieffy_Logo-withoutbg_zoom.png' className="justify-center w-20 sm:w-22 md:w-24 lg:w-32 xl:w-36 cursor-pointer" onClick={()=> {
              navigate('/home')
            }}/>
          </div>
          <Box sx={{ 
                      flexGrow: 1, 
                      display: { xs: 'none', md: 'flex' }, 
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      mx: 2 
                    }}>
              <InputBase
                placeholder="Search Your Cards..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  px: 2,
                  py: 0.5,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  width: '300px',
                  fontSize: '14px',
                  color: '#1f7281'
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Box>

          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
            {pages.map((page) => {
              const isActive = (location.pathname === '/suites' && page === 'Public Space') || (location.pathname === '/home' && page === 'My Space');

              return (
                <Button
                  key={page}
                  onClick={() => {
                    handleCloseNavMenu();
                    if (page === 'Public Space') {
                      navigate('/suites');
                    }else if(page === 'My Space') {
                      navigate('/home');
                    }
                  }}
                  sx={{
                    my: 2,
                    color: '#14304e',
                    display: 'block',
                    bgcolor: { md: isActive ? '#d1fae5' : 'transparent' },
                    borderRadius: '6px',
                    px: 2,
                    '&:hover': {
                      bgcolor: isActive ? '#a7f3d0' : '#f0f0f0',
                    },
                  }}
                >
                  {page}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ flexGrow: 0}}>
          <Tooltip title="Open settings">
  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ml: '2rem', mr: '1.5rem' }} onClick={handleOpenUserMenu}>
  {/* Google-hosted images often block third-party referrers — adding referrerPolicy="no-referrer" tells the browser not to send referrer info, so Google allows the image load */}
  <Avatar 
      alt={user?.name} 
      src={user?.picture} 
      referrerPolicy="no-referrer"
      sx={{ width: 40, height: 40, mr: 1 }}
    > {user?.name?.charAt(0)}</Avatar>
  </Box>
</Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={()=>{handleCloseUserMenu(); if(setting === 'Logout') {
                  logout();
                  navigate("/")
                }}}>
                  <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
