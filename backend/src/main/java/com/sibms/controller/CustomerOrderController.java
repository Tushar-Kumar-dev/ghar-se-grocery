package com.sibms.controller;

import com.sibms.dto.request.CreateCustomerOrderRequest;
import com.sibms.dto.request.UpdateOrderStatusRequest;
import com.sibms.dto.response.ApiResponse;
import com.sibms.dto.response.CustomerOrderResponse;
import com.sibms.service.CustomerOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-orders")
@RequiredArgsConstructor
@Tag(name = "Customer Orders", description = "Online Grocery Orders & Parchi Inward API")
public class CustomerOrderController {

    private final CustomerOrderService orderService;

    @PostMapping
    @Operation(summary = "Customer Home Order Placement (Parchi Photo or Typed List)")
    public ResponseEntity<ApiResponse<CustomerOrderResponse>> createOrder(
            @Valid @RequestBody CreateCustomerOrderRequest request) {
        CustomerOrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully with store", response));
    }

    @GetMapping
    @Operation(summary = "Get All Inward Customer Orders (Store Admin & Cashier Inbox)")
    public ResponseEntity<ApiResponse<List<CustomerOrderResponse>>> getAllOrders() {
        List<CustomerOrderResponse> list = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Track Order by Order Number (Customer Live Tracker)")
    public ResponseEntity<ApiResponse<CustomerOrderResponse>> getOrderByNumber(
            @PathVariable String orderNumber) {
        CustomerOrderResponse response = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{orderNumber}/status")
    @Operation(summary = "Update Order Status (PACKING, OUT_FOR_DELIVERY, READY_FOR_PICKUP, COMPLETED)")
    public ResponseEntity<ApiResponse<CustomerOrderResponse>> updateStatus(
            @PathVariable String orderNumber,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        CustomerOrderResponse response = orderService.updateOrderStatus(orderNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", response));
    }

    @DeleteMapping("/{orderNumber}")
    @Operation(summary = "Cancel or Delete Order")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable String orderNumber) {
        orderService.deleteOrder(orderNumber);
        return ResponseEntity.ok(ApiResponse.success("Order removed", null));
    }
}
