package com.sibms.service;
import com.sibms.dto.request.CreateCustomerRequest;
import com.sibms.dto.request.UpdateCustomerRequest;
import com.sibms.dto.response.CustomerResponse;
import com.sibms.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
public interface CustomerService {
    CustomerResponse create(CreateCustomerRequest request);
    PageResponse<CustomerResponse> search(String search, Pageable pageable);
    CustomerResponse getById(Long id);
    CustomerResponse update(Long id, UpdateCustomerRequest request);
    void deactivate(Long id);
}
