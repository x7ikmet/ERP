"use client";

import { useEffect, useState } from 'react';
import { salesApi, type Sale, type CreateSaleRequest } from '@/api';
import { customersApi, type Customer } from '@/api';
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
  ShoppingCart,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Package,
  Trash2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface SaleFormItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [actioningSale, setActioningSale] = useState<Sale | null>(null);
  const [actionType, setActionType] = useState<'complete' | 'cancel' | null>(null);
  
  const [formData, setFormData] = useState<{
    customerId?: number;
    items: SaleFormItem[];
  }>({
    items: [{ productId: 0, quantity: 1, unitPrice: 0 }]
  });

  // Reset form data
  const resetForm = () => {
    setFormData({
      items: [{ productId: 0, quantity: 1, unitPrice: 0 }]
    });
  };

  // Fetch sales data
  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await salesApi.getSales({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setSales(data.items);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getCustomers();
      setCustomers(data.items || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
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
    fetchCustomers();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchSales();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  // Add new item to form
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: 0, quantity: 1, unitPrice: 0 }]
    }));
  };

  // Remove item from form
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update item in form
  const updateItem = (index: number, field: keyof SaleFormItem, value: number) => {
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
    
    if (formData.items.some(item => item.productId === 0 || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error('Please fill in all item details correctly');
      return;
    }

    try {
      const saleData: CreateSaleRequest = {
        customerId: formData.customerId,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      await salesApi.createSale(saleData);
      toast.success('Sale created successfully!');
      
      // Refresh sales list
      await fetchSales();
      
      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create sale:', error);
      toast.error('Failed to create sale. Please try again.');
    }
  };

  // Handle sale action (complete/cancel)
  const handleSaleAction = async () => {
    if (!actioningSale || !actionType) return;
    
    try {
      if (actionType === 'complete') {
        await salesApi.completeSale(actioningSale.id);
        toast.success('Sale completed successfully!');
      } else if (actionType === 'cancel') {
        await salesApi.cancelSale(actioningSale.id);
        toast.success('Sale cancelled successfully!');
      }
      
      await fetchSales();
      setActioningSale(null);
      setActionType(null);
    } catch (error) {
      console.error(`Failed to ${actionType} sale:`, error);
      toast.error(`Failed to ${actionType} sale. Please try again.`);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setEditingSale(null);
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
      return total + (item.quantity * item.unitPrice);
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
              <BreadcrumbPage>Sales</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
            <p className="text-muted-foreground">Track and manage your sales transactions efficiently.</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer (Optional)</Label>
                  <Select 
                    value={formData.customerId ? formData.customerId.toString() : 'none'} 
                    onValueChange={(value) => setFormData({ ...formData, customerId: value === 'none' ? undefined : parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Customer (Walk-in)</SelectItem>
                      {customers && customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name} - {customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Sale Items</Label>
                    <Button type="button" onClick={addItem} size="sm">
                      <Plus className="mr-2 h-3 w-3" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-2 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Select
                            value={item.productId > 0 ? item.productId.toString() : undefined}
                            onValueChange={(value) => {
                              const productId = parseInt(value);
                              const product = products.find(p => p.id === productId);
                              updateItem(index, 'productId', productId);
                              if (product) {
                                updateItem(index, 'unitPrice', product.unitPrice);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products && products.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} - {formatCurrency(product.unitPrice)}
                                  {product.sku && ` (${product.sku})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            placeholder="Qty"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="w-28">
                          <Input
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="w-28 flex items-center justify-end">
                          <span className="text-sm font-medium">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </span>
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-destructive"
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
                    Create Sale
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
                  placeholder="Search sales by sale number or customer name..."
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

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Sales ({sales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No sales found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria.' : 'Get started by creating your first sale.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Sale
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{sale.saleNo}</p>
                              <p className="text-xs text-muted-foreground">ID: {sale.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sale.customerName ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{sale.customerName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Walk-in</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            {formatCurrency(sale.totalAmount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{sale.items.length} item{sale.items.length !== 1 ? 's' : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(sale.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(sale.createdAt).toLocaleDateString()}
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
                              <DropdownMenuItem onClick={() => setViewingSale(sale)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {sale.status === 'draft' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setActioningSale(sale);
                                      setActionType('complete');
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete Sale
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActioningSale(sale);
                                      setActionType('cancel');
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Sale
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

        {/* Sale Details Dialog */}
        <Dialog open={!!viewingSale} onOpenChange={() => setViewingSale(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sale Details - {viewingSale?.saleNo}</DialogTitle>
            </DialogHeader>
            {viewingSale && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer</Label>
                    <p className="text-sm">{viewingSale.customerName || 'Walk-in Customer'}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(viewingSale.status)}
                    </div>
                  </div>
                  <div>
                    <Label>Created Date</Label>
                    <p className="text-sm">{new Date(viewingSale.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-sm font-medium">{formatCurrency(viewingSale.totalAmount)}</p>
                  </div>
                </div>

                <div>
                  <Label>Sale Items</Label>
                  <div className="mt-2 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingSale.items.map((item) => (
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
                            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
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
        <AlertDialog open={!!actioningSale} onOpenChange={() => { setActioningSale(null); setActionType(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === 'complete' ? 'Complete Sale' : 'Cancel Sale'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === 'complete' 
                  ? `Are you sure you want to complete sale "${actioningSale?.saleNo}"? This action cannot be undone.`
                  : `Are you sure you want to cancel sale "${actioningSale?.saleNo}"? This action cannot be undone.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaleAction}>
                {actionType === 'complete' ? 'Complete Sale' : 'Cancel Sale'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}