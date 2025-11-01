// Payment API Configuration
const BASE_URL = "https://localhost:7025/api"

// Payment API Service class
class PaymentApiService {
  constructor() {
    this.baseURL = BASE_URL
  }

  // Generic fetch method with error handling and authentication
  async fetchData(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken')
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Bearer ${authToken}` }),
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Payment API Error for ${endpoint}:`, error)
      throw error
    }
  }

  // GET: api/Payments - Get all payments
  async getAllPayments() {
    return this.fetchData("/Payments")
  }

  // GET: api/Payments/{id} - Get payment by ID
  async getPaymentById(id) {
    return this.fetchData(`/Payments/${id}`)
  }

  // GET: api/Payments/ByOrder/{orderId} - Get payments by order ID
  async getPaymentsByOrder(orderId) {
    return this.fetchData(`/Payments/ByOrder/${orderId}`)
  }

  // GET: api/Payments/ByTransaction/{transactionId} - Get payment by transaction ID
  async getPaymentByTransaction(transactionId) {
    return this.fetchData(`/Payments/ByTransaction/${transactionId}`)
  }

  // GET: api/Payments/Recent/{count} - Get recent payments
  async getRecentPayments(count = 10) {
    return this.fetchData(`/Payments/Recent/${count}`)
  }

  // GET: api/Payments/Stats - Get payment statistics
  async getPaymentStats() {
    return this.fetchData("/Payments/Stats")
  }

  // POST: api/Payments - Create new payment
  async createPayment(paymentData) {
    return this.fetchData("/Payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  // PUT: api/Payments/{id} - Update payment
  async updatePayment(id, paymentData) {
    return this.fetchData(`/Payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(paymentData),
    })
  }

  // PATCH: api/Payments/{id}/Status - Update payment status
  async updatePaymentStatus(id, status) {
    return this.fetchData(`/Payments/${id}/Status`, {
      method: "PATCH",
      body: JSON.stringify(status),
    })
  }

  // DELETE: api/Payments/{id} - Delete payment
  async deletePayment(id) {
    return this.fetchData(`/Payments/${id}`, {
      method: "DELETE",
    })
  }

  // Helper method to create payment with order
  async processPayment(orderData, paymentMethod = "ewallet") {
    try {
      // First create the order (if needed)
      let orderId = orderData.orderId
      
      if (!orderId && orderData.orderItems) {
        // Create order first if not provided
        const orderResponse = await this.createOrder(orderData)
        orderId = orderResponse.orderId || orderResponse.id
      }

      // Generate transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create payment data
      const paymentData = {
        orderId: orderId,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        amount: orderData.totalAmount || orderData.amount,
        paymentStatus: "pending",
        paidAt: new Date().toISOString(),
        rawResponse: JSON.stringify({
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          paymentMethod: paymentMethod
        })
      }

      // Create payment
      const payment = await this.createPayment(paymentData)

      // Simulate payment processing (in real app, this would be handled by payment gateway)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update payment status to success
      await this.updatePaymentStatus(payment.paymentId, "success")

      return {
        success: true,
        paymentId: payment.paymentId,
        transactionId: transactionId,
        orderId: orderId,
        amount: paymentData.amount
      }
    } catch (error) {
      console.error("Payment processing error:", error)
      throw error
    }
  }

  // Helper method to create order (reuse from existing API)
  async createOrder(orderData) {
    return this.fetchData("/Orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }
}

// Create instance and export methods
export const paymentApiService = new PaymentApiService()

// Export individual methods
export const getAllPayments = paymentApiService.getAllPayments.bind(paymentApiService)
export const getPaymentById = paymentApiService.getPaymentById.bind(paymentApiService)
export const getPaymentsByOrder = paymentApiService.getPaymentsByOrder.bind(paymentApiService)
export const getPaymentByTransaction = paymentApiService.getPaymentByTransaction.bind(paymentApiService)
export const getRecentPayments = paymentApiService.getRecentPayments.bind(paymentApiService)
export const getPaymentStats = paymentApiService.getPaymentStats.bind(paymentApiService)
export const createPayment = paymentApiService.createPayment.bind(paymentApiService)
export const updatePayment = paymentApiService.updatePayment.bind(paymentApiService)
export const updatePaymentStatus = paymentApiService.updatePaymentStatus.bind(paymentApiService)
export const deletePayment = paymentApiService.deletePayment.bind(paymentApiService)
export const processPayment = paymentApiService.processPayment.bind(paymentApiService)

export default paymentApiService