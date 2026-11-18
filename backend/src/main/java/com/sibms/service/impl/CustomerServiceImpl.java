package com.sibms.service.impl;
import com.sibms.dto.request.CreateCustomerRequest;
import com.sibms.dto.request.UpdateCustomerRequest;
import com.sibms.dto.response.CustomerResponse;
import com.sibms.dto.response.PageResponse;
import com.sibms.entity.Customer;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.CustomerRepository;
import com.sibms.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    @Override @Transactional
    public CustomerResponse create(CreateCustomerRequest req) {
        Customer saved = customerRepository.save(Customer.builder()
            .name(req.name().trim()).phone(req.phone()).email(req.email())
            .address(req.address()).gstin(req.gstin()).build());
        return CustomerResponse.from(saved);
    }
    @Override @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> search(String search, Pageable pageable) {
        return PageResponse.from(customerRepository.search(search, pageable).map(CustomerResponse::from));
    }
    @Override @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) { return CustomerResponse.from(find(id)); }
    @Override @Transactional
    public CustomerResponse update(Long id, UpdateCustomerRequest req) {
        Customer c = find(id);
        c.setName(req.name().trim()); c.setPhone(req.phone()); c.setEmail(req.email());
        c.setAddress(req.address()); c.setGstin(req.gstin()); c.setActive(req.active());
        return CustomerResponse.from(c);
    }
    @Override @Transactional
    public void deactivate(Long id) { find(id).setActive(false); }
    private Customer find(Long id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
    }
}
