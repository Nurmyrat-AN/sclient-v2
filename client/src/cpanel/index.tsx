import { AppBar, Container, Toolbar } from "@mui/material";
import { EditPassword, useAuthentification } from "../containers/auth";
import { NavLink, NavLinkProps, Outlet, useLocation, useNavigate } from "react-router-dom";

import { HomeOutlined } from '@mui/icons-material'

export const CPanel = () => {
    const navigate = useNavigate()
    const { auth, refresh } = useAuthentification()
    if (!auth.isAdmin) {
        return <EditPassword refresh={refresh} onClose={() => navigate('/')} />
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100vh', background: '#fff', }}>
            <AppBar position='sticky'>
                <Toolbar variant="dense">
                    <NavLink to='/'><HomeOutlined style={{ fill: 'white' }} /></NavLink>
                    <CustomNavLink to='/cpanel/customers'>Müşderiler</CustomNavLink>
                    <CustomNavLink to={'/cpanel/actions'}>Hereketler</CustomNavLink>
                    <CustomNavLink to={'/cpanel/reports'}>Hasabatlar</CustomNavLink>
                    <CustomNavLink to={'/cpanel/action-types'}>Hereket görnüşleri</CustomNavLink>
                    <CustomNavLink to={'/cpanel/customer-groups'}>Aýratyn toparlamalar</CustomNavLink>
                    <CustomNavLink to={'/cpanel/settings'}>Sazlamalar</CustomNavLink>
                </Toolbar>
            </AppBar>
            <Container maxWidth='xl' style={{ flexGrow: 1, marginTop: 20, display: 'flex', flexDirection: 'column', overflow: 'auto', maxWidth: '100vw' }}>
                <Outlet />
            </Container>
        </div>
    )
}

const CustomNavLink = (props: NavLinkProps) => {
    const location = useLocation()
    return <NavLink className={location.pathname === props.to ? 'active-tab' : undefined} {...props} />

}