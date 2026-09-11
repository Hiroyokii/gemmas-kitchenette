# Gemma's Kitchenette

A web-based **Food Management and Ordering System** developed for **Gemma's Kitchenette**, a local carinderia in Punta I, Tanza, Cavite.

The system provides a centralized platform for managing daily food preparation, menu availability, ingredient inventory, purchases, customer orders, and sales monitoring.

## Overview

Gemma's Kitchenette currently handles customer orders and business operations through manual processes. This system was developed to help organize these activities through a web-based application.

The system supports three user roles:

- **Customer** – browses the daily menu, places orders, and tracks orders.
- **Staff** – assists with order processing and daily operations.
- **Admin** – manages foods, recipes, inventory, purchases, menus, users, orders, and reports.

## Features

### Customer

- User registration and login
- Browse today's menu
- View food details
- View food ratings and reviews
- Add food to cart
- Place pickup or delivery orders
- Choose Cash on Delivery (COD) or simulated GCash payment
- Track order status
- View order history
- View order details
- Submit feedback and ratings for completed orders

### Admin

- Dashboard
- Food management
- Food category management
- Recipe management
- Ingredient inventory management
- Purchase recording
- Daily menu preparation
- Order management
- Order history
- Sales reports
- Inventory monitoring
- Expiration monitoring
- Spoilage and waste tracking
- User management

### Staff

- View customer orders
- Process orders
- Update order status
- Monitor daily food preparation
- View ingredient inventory
- Assist with order processing

## Order Management

The system manages customer orders throughout the order processing workflow.

### Order Status

```text
PENDING
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
OUT_FOR_DELIVERY
   ↓
COMPLETED
```
