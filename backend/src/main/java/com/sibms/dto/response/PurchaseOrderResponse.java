package com.sibms.dto.response;

import com.sibms.entity.PurchaseOrder;
import com.sibms.enums.PurchaseOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PurchaseOrderResponse(
    Long id,
    String poNo,
    Long supplierId,
    String supplierName,
    PurchaseOrderStatus status,
    BigDecimal total,
    Long createdById,
    String createdByName,
    LocalDateTime createdAt,
    LocalDateTime receivedAt,
    List<PurchaseItemResponse> items) {

    public static PurchaseOrderResponse from(PurchaseOrder po) {
        return new PurchaseOrderResponse(
                po.getId(),
                po.getPoNo(),
                po.getSupplier().getId(),
                po.getSupplier().getName(),
                po.getStatus(),
                po.getTotal(),
                po.getCreatedBy() != null ? po.getCreatedBy().getId() : null,
                po.getCreatedBy() != null ? po.getCreatedBy().getName() : null,
                po.getCreatedAt(),
                po.getReceivedAt(),
                po.getItems().stream().map(PurchaseItemResponse::from).toList());
    }
}
