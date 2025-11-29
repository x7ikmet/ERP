"use client";

import React, { useEffect, useState } from 'react';
import { purchasesApi, type Purchase, type CreatePurchaseRequest } from '@/api';
import { suppliersApi, type Supplier } from '@/api';
import { productsApi, type Product } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Truck,
  Package2,
  Trash2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseFormItem {
  productId: number;
  quantity: number;
  unitCost: number;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [actioningPurchase, setActioningPurchase] = useState<Purchase | null>(null);
  const [actionType, setActionType] = useState<'complete' | 'cancel' | null>(null);
  
  const [formData, setFormData] = useState<{
    supplierId?: number;
    items: PurchaseFormItem[];
  }>({
    items: [{ productId: 0, quantity: 1, unitCost: 0 }]
  });
  
  const [productSearchTerms, setProductSearchTerms] = useState<string[]>(['']);
  const [filteredProducts, setFilteredProducts] = useState<Product[][]>([]);

  // Search products via API
  const searchProducts = async (searchTerm: string, itemIndex: number) => {
    if (!searchTerm.trim()) {
      // If no search term, show all products
      const newFilteredProducts = [...filteredProducts];
      newFilteredProducts[itemIndex] = products;
      setFilteredProducts(newFilteredProducts);
      return;
    }

    try {
      const data = await productsApi.getProducts({ q: searchTerm });
      const newFilteredProducts = [...filteredProducts];
      newFilteredProducts[itemIndex] = data.items || [];
      setFilteredProducts(newFilteredProducts);
    } catch (error) {
      console.error('Failed to search products:', error);
      // Fallback to client-side filtering if API fails
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const newFilteredProducts = [...filteredProducts];
      newFilteredProducts[itemIndex] = filtered;
      setFilteredProducts(newFilteredProducts);
    }
  };

  // Debounced search to avoid too many API calls
  const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);
  
  const handleProductSearch = (searchTerm: string, itemIndex: number) => {
    const newSearchTerms = [...productSearchTerms];
    newSearchTerms[itemIndex] = searchTerm;
    setProductSearchTerms(newSearchTerms);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      searchProducts(searchTerm, itemIndex);
    }, 300); // 300ms delay
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      items: [{ productId: 0, quantity: 1, unitCost: 0 }]
    });
    setProductSearchTerms(['']);
    setFilteredProducts([products]); // Reset to show all products for first item
  };

  // Fetch purchases data
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const data = await purchasesApi.getPurchases({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setPurchases(data.items);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const data = await suppliersApi.getSuppliers();
      setSuppliers(data.items || []);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      setSuppliers([]);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const data = await productsApi.getProducts();
      setProducts(data.items || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  // Initialize filtered products when products are loaded
  useEffect(() => {
    if (products.length > 0 && filteredProducts.length === 0) {
      setFilteredProducts([products]); // Initialize first item with all products
    }
  }, [products, filteredProducts.length]);

  useEffect(() => {
    fetchPurchases();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  // Add new item to form
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: 0, quantity: 1, unitCost: 0 }]
    }));
    setProductSearchTerms(prev => [...prev, '']);
    setFilteredProducts(prev => [...prev, products]); // Initialize with all products
  };

  // Remove item from form
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    setProductSearchTerms(prev => prev.filter((_, i) => i !== index));
    setFilteredProducts(prev => prev.filter((_, i) => i !== index));
  };

  // Update item in form
  const updateItem = (index: number, field: keyof PurchaseFormItem, value: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.some(item => item.productId === 0 || item.quantity <= 0 || item.unitCost < 0)) {
      toast.error('Please fill in all item details correctly');
      return;
    }

    try {
      const purchaseData: CreatePurchaseRequest = {
        supplierId: formData.supplierId,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost
        }))
      };

      await purchasesApi.createPurchase(purchaseData);
      toast.success('Purchase created successfully!');
      
      // Refresh purchases list
      await fetchPurchases();
      
      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create purchase:', error);
      toast.error('Failed to create purchase. Please try again.');
    }
  };

  // Handle purchase action (complete/cancel)
  const handlePurchaseAction = async () => {
    if (!actioningPurchase || !actionType) return;
    
    try {
      if (actionType === 'complete') {
        await purchasesApi.completePurchase(actioningPurchase.id);
        toast.success('Purchase completed successfully!');
      } else if (actionType === 'cancel') {
        await purchasesApi.cancelPurchase(actioningPurchase.id);
        toast.success('Purchase cancelled successfully!');
      }
      
      await fetchPurchases();
      setActioningPurchase(null);
      setActionType(null);
    } catch (error) {
      console.error(`Failed to ${actionType} purchase:`, error);
      toast.error(`Failed to ${actionType} purchase. Please try again.`);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unitCost);
    }, 0);
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
              <BreadcrumbPage>Purchases</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
            <p className="text-muted-foreground">Manage your procurement and supplier transactions efficiently.</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Purchase</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-sm font-medium">
                    Supplier <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Select a supplier for this purchase order, or leave blank for direct purchases
                  </p>
                  <Select 
                    value={formData.supplierId?.toString() || 'none'} 
                    onValueChange={(value) => setFormData({ ...formData, supplierId: value === 'none' ? undefined : parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose supplier or direct purchase..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Direct Purchase</span>
                          <span className="text-xs text-muted-foreground">No supplier required</span>
                        </div>
                      </SelectItem>
                      {suppliers && suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{supplier.name}</span>
                            <span className="text-xs text-muted-foreground">{supplier.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Purchase Items</Label>
                    <Button type="button" onClick={addItem} size="sm">
                      <Plus className="mr-2 h-3 w-3" />
                      Add Item
                    </Button>
                  </div>

                  {/* Column Headers */}
                  <div className="flex gap-2 px-3 py-2 bg-muted/30 rounded-lg text-xs font-medium text-muted-foreground">
                    <div className="flex-1">Product</div>
                    <div className="w-20 text-center">Quantity</div>
                    <div className="w-28 text-center">Unit Cost ($)</div>
                    <div className="w-28 text-center">Line Total</div>
                    <div className="w-10"></div>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-2 p-3 border rounded-lg">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs text-muted-foreground">Product *</Label>
                          <Select
                            value={item.productId > 0 ? item.productId.toString() : undefined}
                            onValueChange={(value) => {
                              const productId = parseInt(value);
                              const product = products.find(p => p.id === productId);
                              updateItem(index, 'productId', productId);
                              if (product) {
                                updateItem(index, 'unitCost', product.costPrice);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Search and select product..." />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <Input
                                  placeholder="Type to search products..."
                                  className="h-8"
                                  value={productSearchTerms[index] || ''}
                                  onChange={(e) => {
                                    handleProductSearch(e.target.value, index);
                                  }}
                                />
                              </div>
                              {(filteredProducts[index] || products || []).map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">{product.name}</span>
                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                      {product.sku && <span>SKU: {product.sku}</span>}
                                      <span>Cost: {formatCurrency(product.costPrice)}</span>
                                      <span>Stock: {product.stockQty}</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20 space-y-1">
                          <Label className="text-xs text-muted-foreground">Quantity *</Label>
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <Label className="text-xs text-muted-foreground">Unit Cost *</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="w-28 flex flex-col items-end justify-end space-y-1">
                          <Label className="text-xs text-muted-foreground">Total</Label>
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(item.quantity * item.unitCost)}
                          </span>
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-destructive self-end"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end p-3 bg-muted/50 rounded-lg">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-bold">{formatCurrency(calculateTotal())}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Purchase
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
                  placeholder="Search purchases by purchase number or supplier name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Purchases ({purchases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-8">
                <Package2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No purchases found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria.' : 'Get started by creating your first purchase.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Purchase
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Purchase Details</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{purchase.purchaseNo}</p>
                              <p className="text-xs text-muted-foreground">ID: {purchase.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {purchase.supplierName ? (
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>{purchase.supplierName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Direct Purchase</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            {formatCurrency(purchase.totalAmount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(purchase.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(purchase.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingPurchase(purchase)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {purchase.status === 'draft' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setActioningPurchase(purchase);
                                      setActionType('complete');
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete Purchase
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActioningPurchase(purchase);
                                      setActionType('cancel');
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Purchase
                                  </DropdownMenuItem>
                                </>
                              )}
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

        {/* Purchase Details Dialog */}
        <Dialog open={!!viewingPurchase} onOpenChange={() => setViewingPurchase(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Purchase Details - {viewingPurchase?.purchaseNo}</DialogTitle>
            </DialogHeader>
            {viewingPurchase && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier</Label>
                    <p className="text-sm">{viewingPurchase.supplierName || 'Direct Purchase'}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(viewingPurchase.status)}
                    </div>
                  </div>
                  <div>
                    <Label>Created Date</Label>
                    <p className="text-sm">{new Date(viewingPurchase.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-sm font-medium">{formatCurrency(viewingPurchase.totalAmount)}</p>
                  </div>
                </div>

                <div>
                  <Label>Purchase Items</Label>
                  <div className="mt-2 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingPurchase.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                {item.productSku && (
                                  <p className="text-xs text-muted-foreground">SKU: {item.productSku}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(item.lineTotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <AlertDialog open={!!actioningPurchase} onOpenChange={() => { setActioningPurchase(null); setActionType(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === 'complete' ? 'Complete Purchase' : 'Cancel Purchase'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === 'complete' 
                  ? `Are you sure you want to complete purchase "${actioningPurchase?.purchaseNo}"? This action cannot be undone and will update inventory.`
                  : `Are you sure you want to cancel purchase "${actioningPurchase?.purchaseNo}"? This action cannot be undone.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePurchaseAction}>
                {actionType === 'complete' ? 'Complete Purchase' : 'Cancel Purchase'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}