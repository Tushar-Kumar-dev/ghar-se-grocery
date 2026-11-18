package com.sibms.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
    long totalProducts,
    long lowStockCount,
    long totalCustomers,
    long totalSuppliers,
    long invoicesToday,
    BigDecimal revenueToday,
    BigDecimal totalRevenue,
    long pendingPurchaseOrders,
    List<StockResponse> lowStockProducts
) {}
