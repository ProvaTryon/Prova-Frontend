export interface Product {
  id: string
  name: string
  brand: string
  price: number
  salePrice?: number
  category: string
  sizes: string[]
  colors: string[]
  image: string
  images: string[]
  description: string
  inStock: boolean
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Silk Blend Midi Dress",
    brand: "Elegant Studio",
    price: 189,
    salePrice: 149,
    category: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Burgundy"],
    image: "/elegant-black-midi-dress-on-model.jpg",
    images: [
      "/elegant-black-midi-dress-front.jpg",
      "/elegant-black-midi-dress-back.jpg",
      "/elegant-black-midi-dress-detail.jpg",
    ],
    description: "Luxurious silk blend midi dress with elegant draping and timeless silhouette.",
    inStock: true,
  },
  {
    id: "2",
    name: "Tailored Wool Blazer",
    brand: "Modern Classics",
    price: 299,
    category: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Charcoal", "Camel", "Navy"],
    image: "/tailored-wool-blazer-on-model.jpg",
    images: ["/tailored-wool-blazer-front.jpg", "/tailored-wool-blazer-back.jpg"],
    description: "Impeccably tailored wool blazer with structured shoulders and refined details.",
    inStock: true,
  },
  {
    id: "3",
    name: "Cashmere Turtleneck",
    brand: "Luxe Essentials",
    price: 159,
    category: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Cream", "Black", "Gray", "Camel"],
    image: "/cashmere-turtleneck-sweater.jpg",
    images: ["/cashmere-turtleneck-front.jpg", "/cashmere-turtleneck-detail.jpg"],
    description: "Pure cashmere turtleneck with relaxed fit and luxurious softness.",
    inStock: true,
  },
  {
    id: "4",
    name: "Wide Leg Trousers",
    brand: "Modern Classics",
    price: 129,
    category: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Olive"],
    image: "/wide-leg-trousers-on-model.jpg",
    images: ["/wide-leg-trousers-front.jpg", "/wide-leg-trousers-side.jpg"],
    description: "Flowing wide leg trousers with high waist and elegant drape.",
    inStock: true,
  },
  {
    id: "5",
    name: "Leather Crossbody Bag",
    brand: "Artisan Leather Co",
    price: 249,
    category: "accessories",
    sizes: ["One Size"],
    colors: ["Black", "Tan", "Burgundy"],
    image: "/leather-crossbody-bag.png",
    images: ["/leather-crossbody-bag-front.jpg", "/leather-crossbody-bag-detail.jpg"],
    description: "Handcrafted leather crossbody with adjustable strap and multiple compartments.",
    inStock: true,
  },
  {
    id: "6",
    name: "Merino Wool Cardigan",
    brand: "Luxe Essentials",
    price: 179,
    category: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Oatmeal", "Charcoal", "Forest Green"],
    image: "/placeholder.svg?height=600&width=400",
    images: ["/placeholder.svg?height=600&width=400", "/placeholder.svg?height=600&width=400"],
    description: "Soft merino wool cardigan with button closure and relaxed fit.",
    inStock: true,
  },
  {
    id: "7",
    name: "Slim Fit Oxford Shirt",
    brand: "Modern Classics",
    price: 89,
    category: "men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Light Blue", "Pink"],
    image: "/placeholder.svg?height=600&width=400",
    images: ["/placeholder.svg?height=600&width=400", "/placeholder.svg?height=600&width=400"],
    description: "Classic oxford shirt with slim fit and button-down collar.",
    inStock: true,
  },
  {
    id: "8",
    name: "Leather Chelsea Boots",
    brand: "Heritage Footwear",
    price: 329,
    category: "men",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black", "Brown"],
    image: "/placeholder.svg?height=600&width=400",
    images: ["/placeholder.svg?height=600&width=400", "/placeholder.svg?height=600&width=400"],
    description: "Premium leather Chelsea boots with elastic side panels and durable sole.",
    inStock: true,
  },
  {
    id: "9",
    name: "Pleated Midi Skirt",
    brand: "Elegant Studio",
    price: 139,
    category: "women",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Navy", "Burgundy"],
    image: "/placeholder.svg?height=600&width=400",
    images: ["/placeholder.svg?height=600&width=400", "/placeholder.svg?height=600&width=400"],
    description: "Elegant pleated midi skirt with elastic waistband and flowing silhouette.",
    inStock: true,
  },
  {
    id: "10",
    name: "Minimalist Watch",
    brand: "Timeless Accessories",
    price: 199,
    category: "accessories",
    sizes: ["One Size"],
    colors: ["Silver", "Gold", "Rose Gold"],
    image: "/placeholder.svg?height=600&width=400",
    images: ["/placeholder.svg?height=600&width=400", "/placeholder.svg?height=600&width=400"],
    description: "Sleek minimalist watch with leather strap and Japanese movement.",
    inStock: true,
  },
  {
    id: "11",
    name: "Linen Blend Shirt",
    brand: "Summer Essentials",
    price: 95,
    category: "men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Light Blue", "Sage"],
    image: "/placeholder.svg?height=600&width=400",
    images: ["/placeholder.svg?height=600&width=400", "/placeholder.svg?height=600&width=400"],
    description: "Breathable linen blend shirt perfect for warm weather.",
    inStock: true,
  },
  {
    id: "12",
    name: "Structured Tote Bag",
    brand: "Artisan Leather Co",
    price: 279,
    category: "accessories",
    sizes: ["One Size"],
    colors: ["Black", "Cognac", "Navy"],
    image: "/placeholder.svg?height=600&width=400",
    images: ["/placeholder.svg?height=600&width=400", "/placeholder.svg?height=600&width=400"],
    description: "Spacious structured tote with premium leather and interior pockets.",
    inStock: true,
  },
]

export const brands = [
  "Elegant Studio",
  "Modern Classics",
  "Luxe Essentials",
  "Artisan Leather Co",
  "Heritage Footwear",
  "Timeless Accessories",
  "Summer Essentials",
]

export const categories = [
  { id: "all", name: "All Items" },
  { id: "women", name: "Women" },
  { id: "men", name: "Men" },
  { id: "accessories", name: "Accessories" },
]

export interface Store {
  id: string
  name: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  description: string
  logo?: string
  status: "active" | "pending" | "suspended"
  createdAt: string
  totalProducts: number
  totalSales: number
  revenue: number
}

export const mockStores: Store[] = [
  {
    id: "store-001",
    name: "Elegant Studio",
    ownerId: "store-1",
    ownerName: "Store Owner",
    ownerEmail: "store@prova.com",
    description: "Premium fashion for the modern woman",
    status: "active",
    createdAt: "2024-01-15",
    totalProducts: 3,
    totalSales: 145,
    revenue: 28450,
  },
  {
    id: "store-002",
    name: "Modern Classics",
    ownerId: "store-2",
    ownerName: "Jane Smith",
    ownerEmail: "jane@modernclassics.com",
    description: "Timeless pieces for every wardrobe",
    status: "active",
    createdAt: "2024-02-20",
    totalProducts: 4,
    totalSales: 98,
    revenue: 19230,
  },
  {
    id: "store-003",
    name: "Luxe Essentials",
    ownerId: "store-3",
    ownerName: "Michael Brown",
    ownerEmail: "michael@luxeessentials.com",
    description: "Luxury basics and essentials",
    status: "pending",
    createdAt: "2024-03-10",
    totalProducts: 2,
    totalSales: 0,
    revenue: 0,
  },
]

export interface ChatConversation {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  status: "active" | "waiting" | "resolved"
  priority: "low" | "medium" | "high"
  subject: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  assignedTo?: string
  messages: Array<{
    id: string
    senderId: string
    senderName: string
    senderRole: "customer" | "agent"
    content: string
    timestamp: string
  }>
}

export const mockConversations: ChatConversation[] = [
  {
    id: "conv-1",
    customerId: "customer-1",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    status: "waiting",
    priority: "high",
    subject: "Issue with order #12345",
    lastMessage: "I haven't received my order yet and it's been 2 weeks",
    lastMessageTime: "2024-03-15T10:30:00",
    unreadCount: 2,
    messages: [
      {
        id: "msg-1",
        senderId: "customer-1",
        senderName: "Sarah Johnson",
        senderRole: "customer",
        content: "Hi, I ordered a dress 2 weeks ago but haven't received it yet. Order #12345",
        timestamp: "2024-03-15T10:25:00",
      },
      {
        id: "msg-2",
        senderId: "customer-1",
        senderName: "Sarah Johnson",
        senderRole: "customer",
        content: "I haven't received my order yet and it's been 2 weeks",
        timestamp: "2024-03-15T10:30:00",
      },
    ],
  },
  {
    id: "conv-2",
    customerId: "customer-2",
    customerName: "Michael Chen",
    customerEmail: "michael@example.com",
    status: "active",
    priority: "medium",
    subject: "Question about sizing",
    lastMessage: "Thank you! That helps a lot.",
    lastMessageTime: "2024-03-15T09:15:00",
    unreadCount: 0,
    assignedTo: "cs-1",
    messages: [
      {
        id: "msg-3",
        senderId: "customer-2",
        senderName: "Michael Chen",
        senderRole: "customer",
        content: "What size should I order? I'm usually a medium in most brands.",
        timestamp: "2024-03-15T09:00:00",
      },
      {
        id: "msg-4",
        senderId: "cs-1",
        senderName: "Customer Service",
        senderRole: "agent",
        content:
          "I'd recommend checking our size guide on the product page. Based on your usual size, a medium should work well!",
        timestamp: "2024-03-15T09:10:00",
      },
      {
        id: "msg-5",
        senderId: "customer-2",
        senderName: "Michael Chen",
        senderRole: "customer",
        content: "Thank you! That helps a lot.",
        timestamp: "2024-03-15T09:15:00",
      },
    ],
  },
  {
    id: "conv-3",
    customerId: "customer-3",
    customerName: "Emma Davis",
    customerEmail: "emma@example.com",
    status: "waiting",
    priority: "low",
    subject: "Product recommendation",
    lastMessage: "Looking for a dress for a summer wedding",
    lastMessageTime: "2024-03-15T08:45:00",
    unreadCount: 1,
    messages: [
      {
        id: "msg-6",
        senderId: "customer-3",
        senderName: "Emma Davis",
        senderRole: "customer",
        content: "Looking for a dress for a summer wedding",
        timestamp: "2024-03-15T08:45:00",
      },
    ],
  },
  {
    id: "conv-4",
    customerId: "customer-4",
    customerName: "James Wilson",
    customerEmail: "james@example.com",
    status: "resolved",
    priority: "medium",
    subject: "Return request",
    lastMessage: "Return processed successfully",
    lastMessageTime: "2024-03-14T16:20:00",
    unreadCount: 0,
    assignedTo: "cs-1",
    messages: [
      {
        id: "msg-7",
        senderId: "customer-4",
        senderName: "James Wilson",
        senderRole: "customer",
        content: "I'd like to return the blazer I ordered. It doesn't fit well.",
        timestamp: "2024-03-14T15:00:00",
      },
      {
        id: "msg-8",
        senderId: "cs-1",
        senderName: "Customer Service",
        senderRole: "agent",
        content: "I've initiated your return. You'll receive a return label via email shortly.",
        timestamp: "2024-03-14T16:00:00",
      },
      {
        id: "msg-9",
        senderId: "cs-1",
        senderName: "Customer Service",
        senderRole: "agent",
        content: "Return processed successfully",
        timestamp: "2024-03-14T16:20:00",
      },
    ],
  },
]

export const products = mockProducts
