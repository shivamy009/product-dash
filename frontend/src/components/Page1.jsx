import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';

 
const API_URL = 'https://dummyjson.com/products';

const SORT_OPTIONS = {
    DEFAULT: 'default',
    PRICE: 'price',
    RATING: 'rating',
    STOCK: 'stock',
    TITLE: 'title',
    DISCOUNT: 'discount'
};

const SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc'
};

// Utility functions
const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getStockColorClass = (stock) => {
    if (stock > 50) return 'text-green-600';
    if (stock > 20) return 'text-yellow-600';
    return 'text-red-600';
};

const getStatusColorClass = (status) => {
    return status === 'In Stock'
        ? 'bg-green-100 text-green-700'
        : 'bg-orange-100 text-orange-700';
};

 
const SortIcon = ({ column, sortBy, sortOrder }) => {
    if (sortBy !== column) {
        return <span className="text-gray-400 ml-1">↕</span>;
    }
    return (
        <span className="ml-1 text-yellow-300">
            {sortOrder === SORT_ORDER.ASC ? '↑' : '↓'}
        </span>
    );
};

const LoadingSpinner = () => (
    <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading products...</p>
    </div>
);

const NoResults = () => (
    <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
    </div>
);

const StatCard = ({ label, value, colorClass = 'text-gray-800' }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

const TableHeader = ({ children, sortable = false, column, sortBy, sortOrder, onSort }) => {
    const baseClass = 'px-4 py-3 text-left text-sm font-semibold';
    const sortableClass = sortable ? 'cursor-pointer hover:bg-gray-700' : '';

    return (
        <th
            className={`${baseClass} ${sortableClass}`}
            onClick={sortable ? () => onSort(column) : undefined}
        >
            {children}
            {sortable && <SortIcon column={column} sortBy={sortBy} sortOrder={sortOrder} />}
        </th>
    );
};

const ProductRow = ({ product, index }) => {
    const rowClass = `hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`;

    return (
        <tr className={rowClass}>
            <td className="px-4 py-3">
                <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-lg"
                    loading="lazy"
                />
            </td>
            <td className="px-4 py-3">
                <div className="max-w-xs">
                    <p className="font-medium text-gray-800 truncate">{product.title}</p>
                    <p className="text-xs text-gray-500 truncate">{product.description}</p>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {product.category}
                </span>
            </td>
            <td className="px-4 py-3 text-gray-600">{product.brand || '-'}</td>
            <td className="px-4 py-3">
                <span className="font-semibold text-gray-800">${product.price.toFixed(2)}</span>
            </td>
            <td className="px-4 py-3">
                {product.discountPercentage > 0 ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        -{Math.round(product.discountPercentage)}%
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-gray-700">{product.rating.toFixed(1)}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`font-medium ${getStockColorClass(product.stock)}`}>
                    {product.stock}
                </span>
            </td>
            <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClass(product.availabilityStatus)}`}>
                    {product.availabilityStatus}
                </span>
            </td>
        </tr>
    );
};

 
const Page1 = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState(SORT_OPTIONS.DEFAULT);
    const [sortOrder, setSortOrder] = useState(SORT_ORDER.ASC);

    // Fetch products data
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await axios.get(API_URL);
                setProducts(response.data.products);
            } catch (err) {
                setError('Failed to fetch products. Please try again later.');
                console.error('Error fetching products:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        return [...new Set(products.map((product) => product.category))].sort();
    }, [products]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();

        return products
            .filter((product) => {
                const matchesSearch =
                    product.title.toLowerCase().includes(searchLower) ||
                    product.description.toLowerCase().includes(searchLower) ||
                    (product.brand?.toLowerCase() || '').includes(searchLower);

                const matchesCategory = !categoryFilter || product.category === categoryFilter;

                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                let comparison = 0;

                switch (sortBy) {
                    case SORT_OPTIONS.PRICE:
                        comparison = a.price - b.price;
                        break;
                    case SORT_OPTIONS.RATING:
                        comparison = a.rating - b.rating;
                        break;
                    case SORT_OPTIONS.STOCK:
                        comparison = a.stock - b.stock;
                        break;
                    case SORT_OPTIONS.TITLE:
                        comparison = a.title.localeCompare(b.title);
                        break;
                    case SORT_OPTIONS.DISCOUNT:
                        comparison = a.discountPercentage - b.discountPercentage;
                        break;
                    default:
                        comparison = 0;
                }

                return sortOrder === SORT_ORDER.ASC ? comparison : -comparison;
            });
    }, [products, searchTerm, categoryFilter, sortBy, sortOrder]);

    // Calculate statistics
    const statistics = useMemo(() => {
        if (products.length === 0) return null;

        const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
        const totalRating = products.reduce((sum, p) => sum + p.rating, 0);

        return {
            totalProducts: products.length,
            totalCategories: categories.length,
            avgPrice: (totalPrice / products.length).toFixed(2),
            avgRating: (totalRating / products.length).toFixed(1)
        };
    }, [products, categories]);

     
    const handleSort = useCallback((column) => {
        if (sortBy !== column) {
            // New column: start with ascending
            setSortBy(column);
            setSortOrder(SORT_ORDER.ASC);
        } else if (sortOrder === SORT_ORDER.ASC) {
            // Same column, currently ASC: switch to DESC
            setSortOrder(SORT_ORDER.DESC);
        } else {
            // Same column, currently DESC: reset to default (no sort)
            setSortBy(SORT_OPTIONS.DEFAULT);
            setSortOrder(SORT_ORDER.ASC);
        }
    }, [sortBy, sortOrder]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setCategoryFilter('');
        setSortBy(SORT_OPTIONS.DEFAULT);
        setSortOrder(SORT_ORDER.ASC);
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleCategoryChange = useCallback((e) => {
        setCategoryFilter(e.target.value);
    }, []);

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Products Table View</h1>
                </header>

                {/* Search and Filters */}
                <section className="bg-white rounded-lg shadow-md p-4 mb-6" aria-label="Filters">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div>
                            <label
                                htmlFor="search"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Search
                            </label>
                            <input
                                id="search"
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                aria-label="Search products"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Category
                            </label>
                            <select
                                id="category"
                                value={categoryFilter}
                                onChange={handleCategoryChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                aria-label="Filter by category"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {capitalizeFirst(category)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                aria-label="Clear all filters"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 text-sm text-gray-600" aria-live="polite">
                        Showing {filteredProducts.length} of {products.length} products
                    </div>
                </section>

                {/* Loading State */}
                {isLoading && <LoadingSpinner />}

                {/* Products Table */}
                {!isLoading && (
                    <section className="bg-white rounded-lg shadow-md overflow-hidden" aria-label="Products table">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <TableHeader>Image</TableHeader>
                                        <TableHeader
                                            sortable
                                            column={SORT_OPTIONS.TITLE}
                                            sortBy={sortBy}
                                            sortOrder={sortOrder}
                                            onSort={handleSort}
                                        >
                                            Title
                                        </TableHeader>
                                        <TableHeader>Category</TableHeader>
                                        <TableHeader>Brand</TableHeader>
                                        <TableHeader
                                            sortable
                                            column={SORT_OPTIONS.PRICE}
                                            sortBy={sortBy}
                                            sortOrder={sortOrder}
                                            onSort={handleSort}
                                        >
                                            Price
                                        </TableHeader>
                                        <TableHeader
                                            sortable
                                            column={SORT_OPTIONS.DISCOUNT}
                                            sortBy={sortBy}
                                            sortOrder={sortOrder}
                                            onSort={handleSort}
                                        >
                                            Discount
                                        </TableHeader>
                                        <TableHeader
                                            sortable
                                            column={SORT_OPTIONS.RATING}
                                            sortBy={sortBy}
                                            sortOrder={sortOrder}
                                            onSort={handleSort}
                                        >
                                            Rating
                                        </TableHeader>
                                        <TableHeader
                                            sortable
                                            column={SORT_OPTIONS.STOCK}
                                            sortBy={sortBy}
                                            sortOrder={sortOrder}
                                            onSort={handleSort}
                                        >
                                            Stock
                                        </TableHeader>
                                        <TableHeader>Status</TableHeader>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.map((product, index) => (
                                        <ProductRow
                                            key={product.id}
                                            product={product}
                                            index={index}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* No Results Message */}
                        {filteredProducts.length === 0 && products.length > 0 && <NoResults />}
                    </section>
                )}

                {/* Summary Statistics */}
                {!isLoading && statistics && (
                    <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Statistics">
                        <StatCard label="Total Products" value={statistics.totalProducts} />
                        <StatCard
                            label="Categories"
                            value={statistics.totalCategories}
                            colorClass="text-blue-600"
                        />
                        <StatCard
                            label="Avg. Price"
                            value={`$${statistics.avgPrice}`}
                            colorClass="text-green-600"
                        />
                        <StatCard
                            label="Avg. Rating"
                            value={`★ ${statistics.avgRating}`}
                            colorClass="text-yellow-600"
                        />
                    </section>
                )}
            </div>
        </div>
    );
};

export default Page1;
