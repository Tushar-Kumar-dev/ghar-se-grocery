package com.sibms.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record UpdateCustomerRequest(
    @NotBlank @Size(max = 150) String name,
    @Size(max = 20) String phone,
    @Size(max = 150) String email,
    @Size(max = 255) String address,
    @Size(max = 20) String gstin,
    boolean active
) {}
