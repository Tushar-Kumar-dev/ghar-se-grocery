package com.sibms.service;

import com.sibms.dto.request.CreatePurchaseOrderRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.PurchaseOrderResponse;
import com.sibms.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Pageable;

public interface PurchaseOrderService {
    PurchaseOrderResponse create(CreatePurchaseOrderRequest request, String userEmail);
    PageResponse<PurchaseOrderResponse> search(Long supplierId, PurchaseOrderStatus status, Pageable pageable);
    PurchaseOrderResponse getById(Long id);
    PurchaseOrderResponse updateStatus(Long id, PurchaseOrderStatus status, String userEmail);
}
