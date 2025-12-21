"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Product } from "./mock-data"

interface CartItem extends Product {
  quantity: number
  selectedSize: string
  selectedColor: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, size: string, color: string, quantity?: number) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: Product, size: string, color: string, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color,
      )

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color }]
    })
  }

  const removeItem = (productId: string, size: string, color: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)),
    )
  }

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size, color)
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
