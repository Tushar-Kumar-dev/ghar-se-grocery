package com.sibms.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record CreateSupplierRequest(
    @NotBlank @Size(max = 150) String name,
    @Size(max = 20) String phone,
    @Size(max = 20) String gstin,
    @Size(max = 255) String address
) {}
