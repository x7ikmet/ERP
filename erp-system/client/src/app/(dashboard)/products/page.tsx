"use client";

import { useEffect, useState } from 'react';
import { productsApi, type Product, type CreateProductRequest } from '@/api';
import { categoriesApi, type Category } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Package2,
  BarChart3,
  Hash,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    sku: '',
    slug: '',
    categoryId: 0,
    unitPrice: 0,
    costPrice: 0,
    stockQty: 0,
    barcode: '',
    isActive: true,
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      slug: '',
      categoryId: 0,
      unitPrice: 0,
      costPrice: 0,
      stockQty: 0,
      barcode: '',
      isActive: true,
    });
  };

  // Fetch products data
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getProducts({
        q: searchTerm || undefined,
        categoryName: selectedCategory === 'all' ? undefined : selectedCategory,
      });
      setProducts(data.items);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data.items || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || !formData.categoryId || formData.categoryId === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingProduct) {
        // Update existing product
        await productsApi.updateProduct(editingProduct.id, formData);
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        await productsApi.createProduct(formData);
        toast.success('Product created successfully!');
      }
      
      // Refresh products list
      await fetchProducts();
      
      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product. Please try again.');
    }
  };

  // Handle edit product
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      slug: product.slug,
      categoryId: product.categoryId,
      unitPrice: product.unitPrice,
      costPrice: product.costPrice,
      stockQty: product.stockQty,
      barcode: product.barcode || '',
      isActive: product.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  // Handle delete product
  const handleDelete = async () => {
    if (!deletingProduct) return;
    
    try {
      await productsApi.deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully!');
      await fetchProducts();
      setDeletingProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Low Stock</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage your product inventory and catalog efficiently.</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="iPhone 15 Pro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="IP15PRO128"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="iphone-15-pro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.categoryId > 0 ? formData.categoryId.toString() : undefined} 
                      onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories && categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price * ($)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="999.99"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price * ($)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="750.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockQty">Stock Quantity *</Label>
                    <Input
                      id="stockQty"
                      type="number"
                      min="0"
                      value={formData.stockQty}
                      onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value) || 0 })}
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="1234567890123"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active product</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories && categories.map((category) => (
                      <SelectItem key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No products found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search criteria.' : 'Get started by creating your first product.'}
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {product.sku && (
                                  <span className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    {product.sku}
                                  </span>
                                )}
                                {product.barcode && (
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3" />
                                    {product.barcode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Tag className="h-3 w-3" />
                            {product.categoryName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              {formatCurrency(product.unitPrice)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cost: {formatCurrency(product.costPrice)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStockBadge(product.stockQty)}
                            <span className="text-sm text-muted-foreground">
                              {product.stockQty} units
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(product.isActive)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingProduct(product)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone and will affect any related sales records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}