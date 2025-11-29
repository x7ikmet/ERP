"use client"

import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { statisticsApi, salesApi, type DashboardStatistics, type Sale } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Dashboard stats interface matching API response
interface DashboardStats extends DashboardStatistics {
  salesGrowth: number;
  revenueGrowth: number;
}

interface RecentSale {
  id: number;
  saleNo: string;
  customer: string | null;
  total: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    completedSalesCount: 0,
    pendingSalesCount: 0,
    salesGrowth: 0,
    revenueGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const dashboardStats = await statisticsApi.getDashboardStatistics();
        
        // Fetch recent sales (limit to 5 for dashboard)
        const salesResponse = await salesApi.getSales({ 
          page: 1, 
          pageSize: 5 
        });
        
        // Set stats with mock growth percentages (you can calculate these based on historical data)
        setStats({
          ...dashboardStats,
          salesGrowth: 12.5, // TODO: Calculate based on historical data
          revenueGrowth: 8.3, // TODO: Calculate based on historical data
        });
        
        // Transform sales data to match RecentSale interface
        const transformedSales: RecentSale[] = salesResponse.items.map((sale: Sale) => ({
          id: sale.id,
          saleNo: sale.saleNo,
          customer: sale.customerName || null,
          total: sale.totalAmount,
          status: sale.status,
          createdAt: new Date(sale.createdAt).toISOString().split('T')[0]
        }));
        
        setRecentSales(transformedSales);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">ERP System</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your business today.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.revenueGrowth >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">+{stats.revenueGrowth}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600">{stats.revenueGrowth}%</span>
                  </>
                )}
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSalesCount.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.salesGrowth >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">+{stats.salesGrowth}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600">{stats.salesGrowth}%</span>
                  </>
                )}
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active products in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Active customer accounts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          {/* Sales Chart */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sales performance over the last 6 months
              </p>
            </CardHeader>
            <CardContent>
              <ChartAreaInteractive />
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest transactions and orders
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{sale.saleNo}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.customer || 'Walk-in Customer'}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">${sale.total}</p>
                    {getStatusBadge(sale.status)}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View All Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <SectionCards />
      </div>
    </>
  );
}