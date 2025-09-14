import React from 'react'
import ResetPassword from './Main'
import { Suspense } from 'react'

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div></div>}>
      <ResetPassword />
    </Suspense>
  )
}

export default ResetPasswordPage