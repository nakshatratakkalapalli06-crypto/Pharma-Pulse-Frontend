import { useState, useEffect } from 'react'
import './App.css'

const API = 'http://localhost:8080/api'

const menuItems = [
  { name: 'Dashboard', icon: '⌂' },
  { name: 'Customers', icon: '♧' },
  { name: 'Suppliers', icon: '▣' },
  { name: 'Products', icon: '▰' },
  { name: 'Orders', icon: '🛒' },
  { name: 'Purchase', icon: '▤' },
{ name: 'Sales', icon: '▤' },
{ name: 'Purchase Returns', icon: '↩' },
{ name: 'Sales Returns', icon: '↪' },
{ name: 'Inventory', icon: '◉' },
{ name: 'Analytics', icon: '▥' },
{ name: 'Reports', icon: '▤' },
{ name: 'Settings', icon: '⚙' },
]

const money = value =>
  '₹' + Number(value || 0).toLocaleString('en-IN')

function App() {
  const [page, setPage] = useState('Dashboard')
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const endpoints = [
        `${API}/customers`,
        `${API}/products`,
        `${API}/orders`,
        `${API}/suppliers`,
      ]

      const responses = await Promise.all(
        endpoints.map(url => fetch(url))
      )

      if (responses.some(response => !response.ok)) {
        throw new Error('One or more backend APIs returned an error.')
      }

      const [customerData, productData, orderData, supplierData] =
        await Promise.all(responses.map(response => response.json()))

      setCustomers(Array.isArray(customerData) ? customerData : [])
      setSuppliers(Array.isArray(supplierData) ? supplierData : [])
      setProducts(Array.isArray(productData) ? productData : [])
      setOrders(Array.isArray(orderData) ? orderData : [])
    } catch (err) {
      setError(
        'Could not load all data. Make sure Spring Boot is running on port 8080.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  )

  const pendingOrders = orders.filter(
    order => !['completed', 'delivered', 'cancelled'].includes(
      String(order.status || '').toLowerCase()
    )
  )

  const lowStockProducts = products.filter(
    product => Number(product.stock || 0) <= 10
  )

  const statusCounts = orders.reduce((counts, order) => {
    const status = order.status || 'Unknown'
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {})

  const statCards = [
    ['Total Customers', customers.length, '♧'],
    ['Total Products', products.length, '▰'],
    ['Total Orders', orders.length, '🛒'],
    ['Total Revenue', money(revenue), '₹'],
  ]

  const backButton = (
    <button
      className="action-button"
      onClick={() => setPage('Dashboard')}
    >
      ← Back to Dashboard
    </button>
  )

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-name">
            PharmaPulse<span className="pulse">✦</span>
          </div>
          <p>Track. Predict. Grow.</p>
        </div>

        <nav className="navigation">
          {menuItems.map(item => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? 'active' : ''}`}
              onClick={() => setPage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>PharmaPulse / {page}</span>
          <span className="admin-label">● Admin</span>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <h1>{page}</h1>
              <p>Pharmaceutical Customer &amp; Order Analytics</p>
            </div>
            <span className="date-label">Management Portal</span>
          </div>

          {error && (
            <section className="panel error-message">
              <p>{error}</p>
              <button className="action-button" onClick={loadData}>
                Retry Loading
              </button>
            </section>
          )}

          {loading && <p>Loading business data...</p>}

          {!loading && !error && page === 'Dashboard' && (
            <>
              <div className="stats-grid">
                {statCards.map(([label, value, icon]) => (
                  <div className="stat-card" key={label}>
                    <div className="stat-top">
                      <span>{label}</span>
                      <span className="stat-icon">{icon}</span>
                    </div>
                    <h2>{value}</h2>
                    <p>Live backend data</p>
                  </div>
                ))}
              </div>

              <div className="content-grid">
                <section className="panel">
                  <h3>Welcome to PharmaPulse</h3>
                  <p>
                    Manage pharmaceutical customers, products and orders
                    from one place.
                  </p>
                  <div className="quick-actions">
                    {['Customers', 'Products', 'Orders', 'Analytics'].map(item => (
                      <button
                        className="action-button"
                        key={item}
                        onClick={() => setPage(item)}
                      >
                        Open {item} →
                      </button>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <h3>Business Overview</h3>
                  <p>Orders requiring attention: {pendingOrders.length}</p>
                  <p>Products with stock of 10 or less: {lowStockProducts.length}</p>
                  <button
                    className="action-button"
                    onClick={() => setPage('Inventory')}
                  >
                    Check Inventory →
                  </button>
                </section>
              </div>
            </>
          )}

          {!loading && !error && page === 'Customers' && (
            <section className="panel management-panel">
              <h3>Customers Management</h3>
              <p>Total customers: {customers.length}</p>
              {customers.length === 0 && <p>No customers found.</p>}

              <div className="customer-list">
                {customers.map(customer => (
                  <div className="panel" key={customer.id}>
                    <h3>{customer.name}</h3>
                    <p>Email: {customer.email}</p>
                    <p>Phone: {customer.phone}</p>
                    <p>Region: {customer.region}</p>
                    <p>Type: {customer.customerType}</p>
                  </div>
                ))}
              </div>
              {backButton}
            </section>
          )}

          {!loading && !error && page === 'Products' && (
            <section className="panel management-panel">
              <h3>Products Management</h3>
              <p>Total products: {products.length}</p>

              {products.map(product => (
                <div className="panel" key={product.id}>
                  <h3>{product.name}</h3>
                  <p>Category: {product.category}</p>
                  <p>Price: {money(product.price)}</p>
                  <p>Stock: {product.stock}</p>
                  <p>Manufacturer: {product.manufacturer}</p>
                </div>
              ))}
              {backButton}
            </section>
          )}
          {!loading && !error && page === 'Suppliers' && (
  <section className="panel management-panel">
    <h3>Suppliers Management</h3>
    <p>Total suppliers: {suppliers.length}</p>
<form
  className="panel"
  onSubmit={async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      const response = await fetch('http://localhost:8080/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error()
      await loadData()
      form.reset()
      alert('Supplier added successfully!')
    } catch {
      alert('Could not add supplier. Check the backend.')
    }
  }}
>
  <h3>Add Supplier</h3>
  <input name="name" placeholder="Supplier name" required />
  <input name="email" type="email" placeholder="Email" required />
  <input name="phone" placeholder="Phone" required />
  <input name="address" placeholder="Address" required />
  <input name="region" placeholder="Region" required />
  <button className="action-button" type="submit">Add Supplier</button>
</form>
    {suppliers.map(supplier => (
      <div className="panel" key={supplier.id}>
        <h3>{supplier.name}</h3>
        <p>Email: {supplier.email}</p>
        <p>Phone: {supplier.phone}</p>
        <p>Address: {supplier.address}</p>
        <p>Region: {supplier.region}</p>
      </div>
    ))}

    {backButton}
  </section>
)}

          {!loading && !error && page === 'Orders' && (
            <section className="panel management-panel">
              <h3>Orders Management</h3>
              <p>Total orders: {orders.length}</p>

              {orders.map(order => (
                <div className="panel" key={order.id}>
                  <h3>{order.orderNumber}</h3>
                  <p>Customer: {order.customer?.name || `ID ${order.customer?.id ?? '-'}`}</p>
                  <p>Product: {order.product?.name || `ID ${order.product?.id ?? '-'}`}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Total: {money(order.totalAmount)}</p>
                  <p>Status: {order.status}</p>
                  <p>Payment: {order.paymentStatus}</p>
                </div>
              ))}
              {backButton}
            </section>
          )}

          {!loading && !error && page === 'Analytics' && (
            <section className="panel management-panel">
              <h3>Business Analytics</h3>
              <p>Calculated from your current backend records.</p>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Total Revenue</span>
                  <h2>{money(revenue)}</h2>
                </div>
                <div className="stat-card">
                  <span>Average Order Value</span>
                  <h2>{money(orders.length ? revenue / orders.length : 0)}</h2>
                </div>
                <div className="stat-card">
                  <span>Pending / Active Orders</span>
                  <h2>{pendingOrders.length}</h2>
                </div>
                <div className="stat-card">
                  <span>Low-Stock Products</span>
                  <h2>{lowStockProducts.length}</h2>
                </div>
              </div>

              <h3>Orders by Status</h3>
              {Object.entries(statusCounts).length === 0 && (
                <p>No order data available.</p>
              )}
              {Object.entries(statusCounts).map(([status, count]) => (
                <div className="panel" key={status}>
                  <strong>{status}</strong>
                  <p>{count} order(s)</p>
                  <div className="stock-track">
                    <div
                      className="stock-fill"
                      style={{
                        width: `${(count / Math.max(orders.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {backButton}
            </section>
          )}

          {!loading && !error && page === 'Inventory' && (
            <section className="panel management-panel">
              <h3>Inventory Overview</h3>
              <p>Low-stock threshold: 10 units or fewer.</p>
              <p>Products needing attention: {lowStockProducts.length}</p>

              {products.map(product => (
                <div className="panel" key={product.id}>
                  <h3>{product.name}</h3>
                  <p>Available stock: {product.stock}</p>
                  <p>
                    Stock status: {Number(product.stock || 0) <= 10
                      ? 'Low stock'
                      : 'Stock available'}
                  </p>
                </div>
              ))}
              {backButton}
            </section>
          )}

          {!loading && !error &&
            ['Sales', 'Reports', 'Business Health'].includes(page) && (
              <section className="panel management-panel">
                <h3>{page} Summary</h3>
                <p>Total orders: {orders.length}</p>
                <p>Total order value: {money(revenue)}</p>
                <p>Total customers: {customers.length}</p>
                <p>Total products: {products.length}</p>
                <button
                  className="action-button"
                  onClick={() => setPage('Analytics')}
                >
                  View Analytics →
                </button>
                {backButton}
              </section>
            )}

          {!loading && !error && page === 'Purchase' && (
  <section className="panel management-panel">
    <h3>Purchase Management</h3>
    <p>Record purchases from your pharmaceutical suppliers.</p>

    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget))
        const total = Number(data.quantity) * Number(data.price)

        alert(
          `Purchase recorded for ${data.product}\n` +
          `Supplier: ${data.supplier}\n` +
          `Quantity: ${data.quantity}\n` +
          `Total cost: ₹${total.toFixed(2)}`
        )
        e.currentTarget.reset()
      }}>
      <input name="product" placeholder="Product name" required />
      <input name="supplier" placeholder="Supplier name" required />
      <input name="quantity" type="number" min="1" placeholder="Quantity" required />
      <input name="price" type="number" min="0.01" step="0.01" placeholder="Unit purchase price (₹)" required />
      <button className="action-button" type="submit">Record Purchase</button>
    </form>
    {backButton}
  </section>
)}
      
      {!loading && !error && page === 'Purchase Returns' && (
  <section className="panel management-panel">
    <h3>Purchase Returns Management</h3>
    <p>Record products returned to pharmaceutical suppliers.</p>

    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const data = Object.fromEntries(new FormData(form))
        const total =
          Number(data.quantity) * Number(data.price)

        alert(
          `Purchase return recorded\n` +
          `Product: ${data.product}\n` +
          `Supplier: ${data.supplier}\n` +
          `Quantity returned: ${data.quantity}\n` +
          `Return value: ₹${total.toFixed(2)}\n` +
          `Reason: ${data.reason}`
        )

        form.reset()
      }}
    >
      <input
        name="product"
        placeholder="Product name"
        required
      />

      <input
        name="supplier"
        placeholder="Supplier name"
        required
      />

      <input
        name="quantity"
        type="number"
        min="1"
        placeholder="Quantity returned"
        required
      />

      <input
        name="price"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Unit price (₹)"
        required
      />

      <input
        name="reason"
        placeholder="Reason for return"
        required
      />

      <button className="action-button" type="submit">
        Record Purchase Return
      </button>
    </form>

    {backButton}
  </section>
)}
{!loading && !error && page === 'Sales Returns' && (
  <section className="panel management-panel">
    <h3>Sales Returns Management</h3>
    <p>Record products returned by pharmaceutical customers.</p>

    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const data = Object.fromEntries(new FormData(form))
        const total =
          Number(data.quantity) * Number(data.price)

        alert(
          `Sales return recorded\n` +
          `Customer: ${data.customer}\n` +
          `Product: ${data.product}\n` +
          `Quantity returned: ${data.quantity}\n` +
          `Refund value: ₹${total.toFixed(2)}\n` +
          `Reason: ${data.reason}`
        )

        form.reset()
      }}
    >
      <input name="customer" placeholder="Customer name" required />
      <input name="product" placeholder="Product name" required />
      <input
        name="quantity"
        type="number"
        min="1"
        placeholder="Quantity returned"
        required
      />
      <input
        name="price"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Unit selling price (₹)"
        required
      />
      <input name="reason" placeholder="Reason for return" required />

      <button className="action-button" type="submit">
        Record Sales Return
      </button>
    </form>

    {backButton}
  </section>
)}
    {!loading && !error && page === 'Settings' && (
  <section className="panel management-panel">
    <h3>PharmaPulse Settings</h3>
    <p>Application information and data overview.</p>

    <div className="panel">
      <h3>Application Information</h3>
      <p>Application: PharmaPulse</p>
      <p>Purpose: Pharmaceutical Customer &amp; Order Analytics</p>
      <p>Version: 1.0.0</p>
      <p>Database: MySQL</p>
      <p>Backend API: {API}</p>
    </div>

    <div className="panel">
      <h3>Current Data Summary</h3>
      <p>Total customers: {customers.length}</p>
      <p>Total suppliers: {suppliers.length}</p>
      <p>Total products: {products.length}</p>
      <p>Total orders: {orders.length}</p>
    </div>

    <button
      className="action-button"
      type="button"
      onClick={loadData}
    >
      Refresh Application Data
    </button>

    {backButton}
  </section>
)}
        </section>
      </main>
    </div>
  )
}

export default App