package com.sibms.service.impl;

import com.sibms.dto.response.DashboardResponse;
import com.sibms.dto.response.StockResponse;
import com.sibms.enums.PurchaseOrderStatus;
import com.sibms.repository.*;
import com.sibms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final InvoiceRepository invoiceRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getSummary() {
        long totalProducts = productRepository.count();
        List<StockResponse> lowStockList = stockRepository.findLowStock().stream().map(StockResponse::from).toList();
        long lowStockCount = lowStockList.size();
        long totalCustomers = customerRepository.count();
        long totalSuppliers = supplierRepository.count();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().plusDays(1).atStartOfDay();

        long invoicesToday = invoiceRepository.countBetween(startOfToday, endOfToday);
        BigDecimal revenueToday = invoiceRepository.sumTotalBetween(startOfToday, endOfToday);
        BigDecimal totalRevenue = invoiceRepository.sumTotalAll();

        long pendingPOs = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.ORDERED)
                + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.DRAFT);

        return new DashboardResponse(
                totalProducts,
                lowStockCount,
                totalCustomers,
                totalSuppliers,
                invoicesToday,
                revenueToday != null ? revenueToday : BigDecimal.ZERO,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                pendingPOs,
                lowStockList
        );
    }
}
