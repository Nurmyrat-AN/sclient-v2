import './App.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { AppBar, IconButton, Toolbar } from '@mui/material';
import { Navigate, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom'

import { ActionTypesPage } from './cpanel/pages/action-types';
import { ActionsPage } from './cpanel/pages/actions';
import { AddAction } from './components/AddAction';
import { AishBalanceContextWrapper } from './context/aishbalance';
import { AsyncAutoComplete } from './components/AsyncAutoComplete';
import { AuthContainer } from './containers/auth';
import { CPanel } from './cpanel';
import { CUSTOMER_MODEL } from './types';
import { CustomerGroups } from './cpanel/pages/customer-groups';
import { CustomersPage } from './cpanel/pages/customers';
import { GlobalLoadingContextWrapper } from './context/globalloading';
import React from 'react';
import { ReportsPage } from './cpanel/pages/reports';
import { SettingsOutlined } from '@mui/icons-material';
import { SettingsPage } from './cpanel/pages/settings';
import { _axios } from './config/request';

let controllerCustomer = new AbortController()
const HomePage = () => {
  const [customer, setCustomer] = React.useState<{ full?: CUSTOMER_MODEL | null, barcodes?: string }>({})
  const navigate = useNavigate()
  const getCustomers: (query?: string) => Promise<CUSTOMER_MODEL[]> = async query => {
    controllerCustomer.abort()
    controllerCustomer = new AbortController()
    const { data: { rows } } = await _axios.post(`/customers`, { name: query, limit: 100 }, { signal: controllerCustomer.signal })
    return rows
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100vh', background: '#fff', }}>
      <AppBar position='sticky' color='transparent'>
        <Toolbar variant='dense'>
          <IconButton onClick={() => navigate('/cpanel/customers')} size='small'><SettingsOutlined fontSize='small' /></IconButton>
          <div style={{ width: 10 }} />
          <h3>Super Client</h3>
          <div style={{ flexGrow: 1 }} />
          <div style={{ width: 350, padding: 10 }}>
            <AsyncAutoComplete
              getOptionsAsync={getCustomers}
              getOptionsLabel={option => option.name}
              initialOptions={[]}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              label='Müşderi'
              textFieldProps={{
                onKeyUp: e => {
                  if (e.keyCode === 13) {
                    // @ts-ignore
                    setCustomer(c => ({ ...c, barcodes: e.target.value }))
                  }
                }
              }}
              value={customer.full || null}
              onChange={(e, full) => setCustomer({ full })}
            />
          </div>
        </Toolbar>
      </AppBar>
      <ActionsPage />
      {(customer.full || customer.barcodes) && <AddAction
        actionProps={{ customers: customer.full ? [customer.full.id] : [], barcodes: customer.barcodes }}
        onClose={() => setCustomer({})}
        onSave={console.log}
      />}
    </div>
  )
}


const router = createBrowserRouter([
  {
    path: '/cpanel',
    element: <CPanel />,
    children: [
      {
        path: 'customers',
        element: <CustomersPage />
      }, {
        path: 'action-types',
        element: <ActionTypesPage />
      }, {
        path: 'customer-groups',
        element: <CustomerGroups />
      }, {
        path: 'actions',
        element: <ActionsPage />
      }, {
        path: 'reports',
        element: <ReportsPage />
      }, {
        path: 'settings',
        element: <SettingsPage />
      }, {
        path: '*',
        element: <Navigate to={'/cpanel/customers'} />
      }
    ]
  }, {
    path: '/',
    element: <HomePage />
  }, {
    path: '*',
    element: <Navigate to={'/'} />
  }
])


class App extends React.Component {
  render() {
    return (
      <AuthContainer>
        <AishBalanceContextWrapper>
          <GlobalLoadingContextWrapper>
            <RouterProvider router={router} />
          </GlobalLoadingContextWrapper>
        </AishBalanceContextWrapper>
      </AuthContainer>
    );
  }
}

export default App;
