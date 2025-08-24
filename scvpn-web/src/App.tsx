import RequireAuth from "./components/RequireAuth";
import PersonalLayout from "./pages/personal/Layout";
import PersonalOverview from "./pages/personal/Overview";
import PersonalDevices from "./pages/personal/Devices";
import PersonalAccount from "./pages/personal/Account";
import PersonalBilling from "./pages/personal/Billing";

import BusinessLayout from "./pages/business/Layout";
import BusinessOverview from "./pages/business/Overview";
import BusinessDevices from "./pages/business/Devices";
import BusinessAccount from "./pages/business/Account";
import BusinessBilling from "./pages/business/Billing";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

