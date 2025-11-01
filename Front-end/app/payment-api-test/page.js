"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByOrder,
  getPaymentByTransaction,
  getRecentPayments,
  getPaymentStats,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  processPayment
} from "@/lib/paymentApi"

export default function PaymentApiTestPage() {
  const { isAuthenticated, user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [testData, setTestData] = useState({
    paymentId: "1",
    orderId: "1",
    transactionId: "TXN_123456789",
    status: "success",
    count: "5"
  })

  const [newPayment, setNewPayment] = useState({
    orderId: 1,
    paymentMethod: "ewallet",
    transactionId: `TXN_${Date.now()}`,
    amount: 500000,
    paymentStatus: "pending",
    paidAt: new Date().toISOString(),
    rawResponse: JSON.stringify({ test: "data" })
  })

  const [orderData, setOrderData] = useState({
    customerName: "Nguyễn Văn A",
    customerEmail: "test@example.com",
    customerPhone: "0123456789",
    totalAmount: 500000,
    orderItems: [
      {
        courseId: 1,
        quantity: 1,
        price: 500000
      }
    ]
  })

  const runTest = async (testFunction, testName) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log(`Running test: ${testName}`)
      const response = await testFunction()
      setResult({
        testName,
        success: true,
        data: response,
        timestamp: new Date().toLocaleString()
      })
      console.log(`${testName} success:`, response)
    } catch (err) {
      setError({
        testName,
        message: err.message,
        timestamp: new Date().toLocaleString()
      })
      console.error(`${testName} error:`, err)
    } finally {
      setLoading(false)
    }
  }

  const testFunctions = [
    {
      name: "Get All Payments",
      func: () => getAllPayments(),
      description: "GET /api/Payments"
    },
    {
      name: "Get Payment by ID",
      func: () => getPaymentById(testData.paymentId),
      description: `GET /api/Payments/${testData.paymentId}`
    },
    {
      name: "Get Payments by Order",
      func: () => getPaymentsByOrder(testData.orderId),
      description: `GET /api/Payments/ByOrder/${testData.orderId}`
    },
    {
      name: "Get Payment by Transaction",
      func: () => getPaymentByTransaction(testData.transactionId),
      description: `GET /api/Payments/ByTransaction/${testData.transactionId}`
    },
    {
      name: "Get Recent Payments",
      func: () => getRecentPayments(parseInt(testData.count)),
      description: `GET /api/Payments/Recent/${testData.count}`
    },
    {
      name: "Get Payment Stats",
      func: () => getPaymentStats(),
      description: "GET /api/Payments/Stats"
    },
    {
      name: "Create Payment",
      func: () => createPayment(newPayment),
      description: "POST /api/Payments"
    },
    {
      name: "Update Payment Status",
      func: () => updatePaymentStatus(testData.paymentId, testData.status),
      description: `PATCH /api/Payments/${testData.paymentId}/Status`
    },
    {
      name: "Process Payment (Full Flow)",
      func: () => processPayment(orderData, "ewallet"),
      description: "Complete payment processing with order creation"
    }
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Payment API Test Page</h1>
      
      {/* Authentication Status */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p><strong>Authenticated:</strong> {isAuthenticated ? "✅ Yes" : "❌ No"}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : "None"}</p>
        <p><strong>Token:</strong> {token ? "✅ Present" : "❌ Missing"}</p>
      </div>

      {/* API Endpoint Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">API Endpoint</h2>
        <p><strong>Base URL:</strong> https://localhost:7025/api</p>
        <p><strong>Payment Endpoints:</strong> /Payments/*</p>
      </div>

      {/* Test Data Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Test Data</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Payment ID:</label>
              <input
                type="text"
                value={testData.paymentId}
                onChange={(e) => setTestData({...testData, paymentId: e.target.value})}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Order ID:</label>
              <input
                type="text"
                value={testData.orderId}
                onChange={(e) => setTestData({...testData, orderId: e.target.value})}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Transaction ID:</label>
              <input
                type="text"
                value={testData.transactionId}
                onChange={(e) => setTestData({...testData, transactionId: e.target.value})}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Status:</label>
              <select
                value={testData.status}
                onChange={(e) => setTestData({...testData, status: e.target.value})}
                className="w-full border rounded px-2 py-1"
              >
                <option value="pending">pending</option>
                <option value="success">success</option>
                <option value="failed">failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Count:</label>
              <input
                type="number"
                value={testData.count}
                onChange={(e) => setTestData({...testData, count: e.target.value})}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">New Payment Data</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Amount:</label>
              <input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({...newPayment, amount: parseInt(e.target.value)})}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Payment Method:</label>
              <select
                value={newPayment.paymentMethod}
                onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}
                className="w-full border rounded px-2 py-1"
              >
                <option value="ewallet">E-Wallet</option>
                <option value="bank">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Payment Status:</label>
              <select
                value={newPayment.paymentStatus}
                onChange={(e) => setNewPayment({...newPayment, paymentStatus: e.target.value})}
                className="w-full border rounded px-2 py-1"
              >
                <option value="pending">pending</option>
                <option value="success">success</option>
                <option value="failed">failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {testFunctions.map((test, index) => (
          <button
            key={index}
            onClick={() => runTest(test.func, test.name)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-lg text-left"
          >
            <div className="font-semibold">{test.name}</div>
            <div className="text-sm opacity-90">{test.description}</div>
          </button>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600 mr-3"></div>
            <span>Testing API...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Test Failed: {error.testName}</h3>
          <p className="text-red-700 mb-2"><strong>Error:</strong> {error.message}</p>
          <p className="text-sm text-red-600">Time: {error.timestamp}</p>
        </div>
      )}

      {/* Success Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Test Passed: {result.testName}</h3>
          <p className="text-sm text-green-600 mb-3">Time: {result.timestamp}</p>
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold mb-2">Response Data:</h4>
            <pre className="text-sm overflow-auto max-h-96 bg-gray-50 p-2 rounded">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure you are logged in to test authenticated endpoints</li>
          <li>Ensure the backend server is running on https://localhost:7025</li>
          <li>Test "Get Payment Stats" first to check basic connectivity</li>
          <li>Use "Create Payment" to create test data</li>
          <li>Test "Process Payment" for the complete payment flow</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  )
}