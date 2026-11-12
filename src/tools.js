import { tool } from '@strands-agents/sdk'
import { z } from 'zod'
import { pool } from './db.js'

const NAME_MATCH = `(c.first_name || ' ' || c.last_name) ILIKE '%' || $1 || '%'`

export const getCustomerDetails = tool({
  name: 'get_customer_details',
  description:
    'Find customers by (part of) their name and return their profile: name, contact details, ' +
    'date of birth, address and country.',
  inputSchema: z.object({
    customer: z.string().describe('Full or partial customer name, for example "Anna"'),
  }),
  callback: async ({ customer }) => {
    const { rows } = await pool.query(
      `SELECT c.id, c.first_name AS "firstName", c.last_name AS "lastName", c.email, c.phone,
              c.date_of_birth AS "dateOfBirth", c.street, c.postal_code AS "postalCode",
              c.city, c.country, c.created_at AS "customerSince"
       FROM customers c
       WHERE ${NAME_MATCH}
       ORDER BY c.id`,
      [customer],
    )
    if (rows.length === 0) return { error: `No customer matches "${customer}"` }
    return { customers: rows }
  },
})

export const getCustomerOrders = tool({
  name: 'get_customer_orders',
  description:
    'Find customers by (part of) their name and return their orders, order count and total spent.',
  inputSchema: z.object({
    customer: z.string().describe('Full or partial customer name, for example "Kari"'),
  }),
  callback: async ({ customer }) => {
    const { rows } = await pool.query(
      `SELECT c.id AS customer_id, c.first_name || ' ' || c.last_name AS name, c.country,
              o.id AS order_id, p.name AS product, o.quantity,
              o.quantity * p.price AS amount, o.ordered_at
       FROM customers c
       LEFT JOIN orders o   ON o.customer_id = c.id
       LEFT JOIN products p ON p.id = o.product_id
       WHERE ${NAME_MATCH}
       ORDER BY c.id, o.ordered_at`,
      [customer],
    )
    if (rows.length === 0) return { error: `No customer matches "${customer}"` }

    const byCustomer = new Map()
    for (const r of rows) {
      if (!byCustomer.has(r.customer_id)) {
        byCustomer.set(r.customer_id, {
          name: r.name, country: r.country,
          orderCount: 0, totalSpent: 0, orders: [],
        })
      }
      const c = byCustomer.get(r.customer_id)
      if (r.order_id === null) continue
      c.orderCount += 1
      c.totalSpent += r.amount
      c.orders.push({
        orderId: r.order_id, product: r.product, quantity: r.quantity,
        orderedAt: r.ordered_at,
      })
    }
    return { customers: [...byCustomer.values()] }
  },
})

export const getProductSales = tool({
  name: 'get_product_sales',
  description: 'Show units sold and revenue per product, best seller first.',
  inputSchema: z.object({}),
  callback: async () => {
    const { rows } = await pool.query(
      `SELECT p.name AS product, p.price,
              COALESCE(SUM(o.quantity), 0)::int            AS units_sold,
              COALESCE(SUM(o.quantity * p.price), 0)::float AS revenue
       FROM products p
       LEFT JOIN orders o ON o.product_id = p.id
       GROUP BY p.id
       ORDER BY units_sold DESC`,
    )
    return { products: rows }
  },
})

export const deleteOrder = tool({
  name: 'delete_order',
  description: 'Delete one order by its order id.',
  inputSchema: z.object({
    orderId: z.number().int().describe('The order id to delete'),
  }),
  callback: async ({ orderId }) => {
    const { rows } = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId])
    if (rows.length === 0) return { error: `Order ${orderId} not found` }
    return { deleted: rows[0] }
  },
})

export const dbTools = [getCustomerDetails, getCustomerOrders, getProductSales, deleteOrder]
