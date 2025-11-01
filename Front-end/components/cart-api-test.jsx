"use client"

import { useState } from 'react'
import { 
  getCartByUser, 
  addToCartAPI, 
  clearCartAPI, 
  deleteCartItemByCartAndCourse,
  getCartSummaryByUser,
  getAllCourses 
} from '@/lib/api'

export default function CartApiTest() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [userId, setUserId] = useState(1) // Default test user ID
  const [courseId, setCourseId] = useState(1) // Default test course ID

  const handleApiCall = async (apiFunction, ...args) => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFunction(...args)
      setResult(data)
      console.log('API Result:', data)
    } catch (err) {
      setError(err.message)
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Cart API Test & Documentation</h1>
      
      {/* Input Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Parameters</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">User ID:</label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Course ID:</label>
            <input
              type="number"
              value={courseId}
              onChange={(e) => setCourseId(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* API Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => handleApiCall(getCartByUser, userId)}
          disabled={loading}
          className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Get Cart by User
        </button>

        <button
          onClick={() => handleApiCall(getCartSummaryByUser, userId)}
          disabled={loading}
          className="p-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Get Cart Summary
        </button>

        <button
          onClick={() => handleApiCall(addToCartAPI, { userId, courseId, quantity: 1 })}
          disabled={loading}
          className="p-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Add to Cart
        </button>

        <button
          onClick={() => handleApiCall(clearCartAPI, userId)}
          disabled={loading}
          className="p-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Clear Cart
        </button>

        <button
          onClick={() => handleApiCall(getAllCourses)}
          disabled={loading}
          className="p-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Get All Courses
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-semibold">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2">API Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* API Documentation */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Cart API Documentation</h2>
        
        <div className="space-y-6">
          {/* Cart Endpoints */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-blue-600">Cart Endpoints</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">GET /api/Carts/ByUser/{userId}</h4>
                <p className="text-gray-600">Lấy giỏ hàng của user. Tự động tạo giỏ hàng mới nếu chưa có.</p>
                <code className="bg-gray-100 p-2 rounded block mt-2">
                  getCartByUser(userId)
                </code>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">GET /api/Carts/Summary/ByUser/{userId}</h4>
                <p className="text-gray-600">Lấy tóm tắt giỏ hàng (tổng số lượng và tổng tiền).</p>
                <code className="bg-gray-100 p-2 rounded block mt-2">
                  getCartSummaryByUser(userId)
                </code>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">POST /api/Carts/AddToCart</h4>
                <p className="text-gray-600">Thêm khóa học vào giỏ hàng.</p>
                <code className="bg-gray-100 p-2 rounded block mt-2">
                  addToCartAPI({`{userId, courseId, quantity}`})
                </code>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">DELETE /api/Carts/Clear/{userId}</h4>
                <p className="text-gray-600">Xóa tất cả items trong giỏ hàng của user.</p>
                <code className="bg-gray-100 p-2 rounded block mt-2">
                  clearCartAPI(userId)
                </code>
              </div>
            </div>
          </div>

          {/* CartItems Endpoints */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-600">CartItems Endpoints</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">GET /api/CartItems/ByCart/{cartId}</h4>
                <p className="text-gray-600">Lấy tất cả items trong một giỏ hàng.</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold">PUT /api/CartItems/{id}</h4>
                <p className="text-gray-600">Cập nhật số lượng của một cart item.</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">DELETE /api/CartItems/{id}</h4>
                <p className="text-gray-600">Xóa một cart item khỏi giỏ hàng.</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold">PATCH /api/CartItems/{id}/Increase</h4>
                <p className="text-gray-600">Tăng số lượng của cart item lên 1.</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold">PATCH /api/CartItems/{id}/Decrease</h4>
                <p className="text-gray-600">Giảm số lượng của cart item xuống 1. Xóa nếu số lượng </p>
              </div>
            </div>
          </div>

          {/* Data Structures */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-purple-600">Data Structures</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">CartDTO Response:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
{`{
  "cartId": 1,
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00Z",
  "cartItems": [
    {
      "cartItemId": 1,
      "cartId": 1,
      "courseId": 1,
      "quantity": 1,
      "addedAt": "2024-01-01T00:00:00Z",
      "course": {
        "courseId": 1,
        "title": "React Course",
        "thumbnailUrl": "/react-course.jpg",
        "price": 500000,
        "instructorId": 1,
        "instructorName": "John Doe"
      }
    }
  ],
  "totalAmount": 500000,
  "totalItems": 1
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold">AddToCart Request:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm">
{`{
  "userId": 1,
  "courseId": 1,
  "quantity": 1
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-indigo-600">Usage Examples</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">1. Thêm khóa học vào giỏ hàng:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm">
{`import { addToCartAPI } from '@/lib/api'

const handleAddToCart = async (courseId) => {
  try {
    const result = await addToCartAPI({
      userId: currentUser.id,
      courseId: courseId,
      quantity: 1
    })
    console.log('Added to cart:', result)
  } catch (error) {
    console.error('Error:', error)
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold">2. Lấy giỏ hàng của user:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm">
{`import { getCartByUser } from '@/lib/api'

const loadUserCart = async (userId) => {
  try {
    const cart = await getCartByUser(userId)
    setCartData(cart)
  } catch (error) {
    console.error('Error loading cart:', error)
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold">3. Sử dụng với Cart Context:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm">
{`import { useCart } from '@/lib/cart-context'

function MyComponent() {
  const { 
    cart, 
    loading, 
    error, 
    addToCart, 
    removeFromCart, 
    getCartTotal 
  } = useCart()

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>Total: {getCartTotal()}</p>
      {cart.map(item => (
        <div key={item.course.courseId}>
          {item.course.title} - {item.quantity}
        </div>
      ))}
    </div>
  )
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}