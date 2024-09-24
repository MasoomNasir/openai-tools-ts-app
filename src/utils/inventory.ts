export interface InventoryItem {
    productId: number;
    productName: string;
    category: string;
    price: number;
    stockQuantity: number;
    rating: number;
}

export enum Category {
    Electronics = "Electronics",
    Furniture = "Furniture",
    Accessories = "Accessories",
}

const inventory: InventoryItem[] = [
    {
        productId: 1,
        productName: "Laptop",
        category: "Electronics",
        price: 1000,
        stockQuantity: 50,
        rating: 4.7,
    },
    {
        productId: 2,
        productName: "Smartphone",
        category: "Electronics",
        price: 700,
        stockQuantity: 150,
        rating: 4.5,
    },
    {
        productId: 3,
        productName: "Desk Chair",
        category: "Furniture",
        price: 120,
        stockQuantity: 85,
        rating: 4.1,
    },
    {
        productId: 4,
        productName: "Monitor",
        category: "Electronics",
        price: 300,
        stockQuantity: 70,
        rating: 4.6,
    },
    {
        productId: 5,
        productName: "Water Bottle",
        category: "Accessories",
        price: 25,
        stockQuantity: 500,
        rating: 4.8,
    }
];

export function getTotalProductCount() {
    return inventory.length;
}

export function getTotalItemCount() {
    return inventory.reduce((total, product) => total + product.stockQuantity, 0);
}

export function getTopRatedProduct() {
    return inventory.reduce((topProduct, currentProduct) =>
        currentProduct.rating > topProduct.rating ? currentProduct : topProduct
    );
}

export function getProductsByCategory(category: Category) {
    const products = inventory.filter(product => product.category === category);
    if (products.length === 0) {
        throw new Error("No products found in this category");
    }
    return {
        products: products,
        totalProducts: products.length,
    };
}

export function getCategories() {
    return Object.values(Category);
}

export function getProductById(productId: number): InventoryItem | string {
    const product = inventory.find(product => product.productId === productId);
    if (!product) {
        return "Product not found";
    }
    return product;
}

export function getProductByName(productName: string): InventoryItem | string {
    const product = inventory.find(product => product.productName === productName);
    if (!product) {
        return "Product not found";
    }
    return product;
}

