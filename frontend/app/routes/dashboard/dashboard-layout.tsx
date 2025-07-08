import React from 'react'
import { useAuth } from '@/provider/auth-context'
import { Button } from '@/components/ui/button'
const DashboardLayout = () => {
  const {user,logout} =useAuth()

  return (
    <div>
    <Button onClick={logout}>Logout</Button>
    </div>
  )
}

export default DashboardLayout