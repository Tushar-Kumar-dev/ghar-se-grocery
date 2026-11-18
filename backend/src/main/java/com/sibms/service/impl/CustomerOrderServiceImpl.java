package com.sibms.service.impl;

import com.sibms.dto.request.CreateCustomerOrderRequest;
import com.sibms.dto.request.UpdateOrderStatusRequest;
import com.sibms.dto.response.CustomerOrderResponse;
import com.sibms.entity.CustomerOrder;
import com.sibms.enums.CustomerOrderStatus;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.CustomerOrderRepository;
import com.sibms.service.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerOrderServiceImpl implements CustomerOrderService {

    private final CustomerOrderRepository orderRepository;
    private final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public CustomerOrderResponse createOrder(CreateCustomerOrderRequest req) {
        String orderNum = req.orderNumber();
        if (orderNum == null || orderNum.isBlank() || orderRepository.existsByOrderNumber(orderNum)) {
            orderNum = "ORD-" + (1000 + random.nextInt(9000));
        }

        CustomerOrder order = CustomerOrder.builder()
                .orderNumber(orderNum)
                .storeName(req.storeName() != null ? req.storeName() : "Apna Bazar Supermarket")
                .customerName(req.customerName().trim())
                .customerPhone(req.customerPhone().trim())
                .fulfillmentMode(req.fulfillmentMode() != null ? req.fulfillmentMode().toLowerCase() : "delivery")
                .deliveryAddress(req.deliveryAddress().trim())
                .listType(req.listType() != null ? req.listType() : "Manual Items")
                .parchiImageUrl(req.parchiImageUrl())
                .itemsSummary(req.itemsSummary())
                .itemsJson(req.itemsJson())
                .estimatedTotal(req.estimatedTotal() != null ? req.estimatedTotal() : BigDecimal.valueOf(540))
                .status(CustomerOrderStatus.PENDING_REVIEW)
                .build();

        CustomerOrder saved = orderRepository.save(order);
        return CustomerOrderResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerOrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByPlacedAtDesc().stream()
                .map(CustomerOrderResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerOrderResponse getOrderByNumber(String orderNumber) {
        CustomerOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return CustomerOrderResponse.from(order);
    }

    @Override
    @Transactional
    public CustomerOrderResponse updateOrderStatus(String orderNumber, UpdateOrderStatusRequest req) {
        CustomerOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));

        try {
            CustomerOrderStatus newStatus = CustomerOrderStatus.valueOf(req.status().toUpperCase());
            order.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + req.status());
        }

        CustomerOrder updated = orderRepository.save(order);
        return CustomerOrderResponse.from(updated);
    }

    @Override
    @Transactional
    public void deleteOrder(String orderNumber) {
        CustomerOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        orderRepository.delete(order);
    }
}
