package com.sibms.dto.response;

import com.sibms.entity.CustomerOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CustomerOrderResponse(
        Long id,
        String orderId,
        String storeName,
        String customerName,
        String customerPhone,
        String fulfillmentMode,
        String address,
        String listType,
        String parchiImg,
        String itemsSummary,
        String itemsJson,
        BigDecimal estimatedTotal,
        String status,
        LocalDateTime placedAt,
        LocalDateTime updatedAt
) {
    public static CustomerOrderResponse from(CustomerOrder o) {
        return new CustomerOrderResponse(
                o.getId(),
                o.getOrderNumber(),
                o.getStoreName(),
                o.getCustomerName(),
                o.getCustomerPhone(),
                o.getFulfillmentMode(),
                o.getDeliveryAddress(),
                o.getListType(),
                o.getParchiImageUrl(),
                o.getItemsSummary(),
                o.getItemsJson(),
                o.getEstimatedTotal(),
                o.getStatus().name(),
                o.getPlacedAt(),
                o.getUpdatedAt()
        );
    }
}
