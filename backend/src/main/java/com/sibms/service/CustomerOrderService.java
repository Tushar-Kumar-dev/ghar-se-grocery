package com.sibms.service;

import com.sibms.dto.request.CreateCustomerOrderRequest;
import com.sibms.dto.request.UpdateOrderStatusRequest;
import com.sibms.dto.response.CustomerOrderResponse;

import java.util.List;

public interface CustomerOrderService {
    CustomerOrderResponse createOrder(CreateCustomerOrderRequest request);
    List<CustomerOrderResponse> getAllOrders();
    CustomerOrderResponse getOrderByNumber(String orderNumber);
    CustomerOrderResponse updateOrderStatus(String orderNumber, UpdateOrderStatusRequest request);
    void deleteOrder(String orderNumber);
}
