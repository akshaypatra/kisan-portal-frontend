import React from 'react'
import MandiMarketDashboardRedux from '../Mandi-components/MandiMarketDashboardRedux'
import { Provider } from 'react-redux'
import store from '../Mandi-components/store'

export default function Dashboard() {
  return (
    <div>Dashboard
        <Provider store={store}>
            <MandiMarketDashboardRedux />
        </Provider>
    </div>
  )
}
